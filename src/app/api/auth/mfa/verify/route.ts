/**
 * MFA Verification API
 * POST /api/auth/mfa/verify
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel, SessionModel } from "@/lib/db/models";
import { mfaVerifySchema } from "@/lib/validations";
import {
  verifyMfaToken,
  verifyTotpCode,
  verifyString,
  generateAccessToken,
  generateRefreshToken,
  hashString,
} from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  parseBody,
  checkRateLimit,
  resetRateLimit,
  getClientIp,
  getDeviceInfo,
  logAudit,
} from "@/lib/api/utils";
import type { UserPublic, MfaVerifyRequest, LoginResponse } from "@/types";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    // Rate limiting
    const rateLimitKey = `mfa:${ip}`;
    const { allowed, error: rateLimitError } = await checkRateLimit(
      rateLimitKey,
      "mfa",
    );

    if (!allowed) {
      return rateLimitError!;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<MfaVerifyRequest>(
      request,
      mfaVerifySchema,
    );

    if (parseError) {
      return parseError;
    }

    // Verify MFA token
    const mfaPayload = await verifyMfaToken(data!.mfaToken);

    if (!mfaPayload) {
      return errorResponse(
        "INVALID_TOKEN",
        "Invalid or expired MFA token",
        401,
      );
    }

    await connectDB();

    // Find user
    const user = await UserModel.findById(mfaPayload.sub);

    if (!user || user.status !== "active") {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    const userId = user._id.toString();

    // Also rate limit by user
    const userRateLimitKey = `mfa:user:${userId}`;
    const { allowed: userAllowed, error: userRateLimitError } =
      await checkRateLimit(userRateLimitKey, "mfa");

    if (!userAllowed) {
      return userRateLimitError!;
    }

    let isValid = false;

    // Verify based on method
    switch (data!.method) {
      case "totp":
        if (!user.mfaSecret) {
          return errorResponse(
            "MFA_NOT_CONFIGURED",
            "TOTP not configured",
            400,
          );
        }
        isValid = verifyTotpCode(user.mfaSecret, data!.code);
        break;

      case "backup":
        if (!user.mfaBackupCodes || user.mfaBackupCodes.length === 0) {
          return errorResponse(
            "NO_BACKUP_CODES",
            "No backup codes available",
            400,
          );
        }

        // Check each backup code
        for (let i = 0; i < user.mfaBackupCodes.length; i++) {
          const codeValid = await verifyString(
            data!.code,
            user.mfaBackupCodes[i],
          );
          if (codeValid) {
            isValid = true;
            // Remove used backup code
            user.mfaBackupCodes.splice(i, 1);
            await UserModel.updateOne(
              { _id: user._id },
              { mfaBackupCodes: user.mfaBackupCodes },
            );
            break;
          }
        }
        break;

      case "email":
        // Email OTP would be implemented here
        // For now, we'll return an error
        return errorResponse(
          "NOT_IMPLEMENTED",
          "Email MFA not yet implemented",
          501,
        );

      default:
        return errorResponse("INVALID_METHOD", "Invalid MFA method", 400);
    }

    if (!isValid) {
      await logAudit(userId, "login_failed", request, {
        resourceType: "user",
        resourceId: userId,
        metadata: { reason: "invalid_mfa_code", method: data.method },
      });

      return errorResponse("INVALID_CODE", "Invalid verification code", 401);
    }

    // Reset rate limits on success
    await Promise.all([
      resetRateLimit(rateLimitKey),
      resetRateLimit(userRateLimitKey),
    ]);

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(userId, user.email),
      generateRefreshToken(userId, user.email),
    ]);

    // Create session
    const deviceInfo = getDeviceInfo(request);
    const refreshTokenHash = await hashString(refreshToken);

    await SessionModel.create({
      userId,
      refreshTokenHash,
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Update last login
    await UserModel.updateOne(
      { _id: user._id },
      { lastLoginAt: new Date(), lastActiveAt: new Date() },
    );

    // Log successful login
    await logAudit(userId, "login", request, {
      resourceType: "user",
      resourceId: userId,
      metadata: { mfaMethod: data.method },
    });

    // Prepare public user data
    const userPublic: UserPublic = {
      _id: userId,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      avatarUrl: user.avatarUrl,
      mfaEnabled: user.mfaEnabled,
      settings: user.settings,
      createdAt: user.createdAt,
    };

    const response: LoginResponse = {
      requiresMfa: false,
      user: userPublic,
      accessToken,
      refreshToken,
      encryptedVaultKey: user.encryptedVaultKey,
      salt: user.authSalt,
    };

    return successResponse(response);
  } catch (error) {
    console.error("MFA verification error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
