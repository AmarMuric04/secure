/**
 * User Login API
 * POST /api/auth/login
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel, SessionModel } from "@/lib/db/models";
import { loginSchema } from "@/lib/validations";
import {
  verifyAuthHash,
  generateAccessToken,
  generateRefreshToken,
  generateMfaToken,
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
import type { UserPublic, LoginRequest, LoginResponse } from "@/types";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    // Rate limiting by IP
    const rateLimitKey = `login:${ip}`;
    const { allowed, error: rateLimitError } = await checkRateLimit(
      rateLimitKey,
      "login",
    );

    if (!allowed) {
      return rateLimitError!;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<LoginRequest>(
      request,
      loginSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Find user by email
    const user = await UserModel.findOne({
      email: data!.email,
      status: "active",
    });

    if (!user) {
      // Log failed attempt
      await logAudit("unknown", "login_failed", request, {
        metadata: { email: data!.email, reason: "user_not_found" },
      });

      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401,
      );
    }

    // Also rate limit by user ID to prevent distributed attacks
    const userRateLimitKey = `login:user:${user._id}`;
    const { allowed: userAllowed, error: userRateLimitError } =
      await checkRateLimit(userRateLimitKey, "login");

    if (!userAllowed) {
      return userRateLimitError!;
    }

    // Ensure user has an authHash
    if (!user.authHash) {
      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401,
      );
    }

    // Verify password
    const isValid = await verifyAuthHash(data!.authHash, user.authHash);

    if (!isValid) {
      // Log failed attempt
      await logAudit(user._id.toString(), "login_failed", request, {
        resourceType: "user",
        resourceId: user._id.toString(),
        metadata: { reason: "invalid_password" },
      });

      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401,
      );
    }

    // Reset rate limit on successful password verification
    await Promise.all([
      resetRateLimit(rateLimitKey),
      resetRateLimit(userRateLimitKey),
    ]);

    const userId = user._id.toString();

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      const mfaToken = await generateMfaToken(userId, user.email);

      const response: LoginResponse = {
        requiresMfa: true,
        mfaToken,
      };

      return successResponse(response);
    }

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
    console.error("Login error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
