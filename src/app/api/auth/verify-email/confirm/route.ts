/**
 * Confirm Email Verification API
 * POST /api/auth/verify-email/confirm
 *
 * Verifies the code and completes user registration
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import {
  UserModel,
  CategoryModel,
  EmailVerificationTokenModel,
} from "@/lib/db/models";
import {
  hashAuthHash,
  generateAccessToken,
  generateRefreshToken,
  generateRecoveryKey,
  hashString,
} from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  parseBody,
  checkRateLimit,
  getClientIp,
  logAudit,
} from "@/lib/api/utils";
import { z } from "zod";
import type { UserPublic } from "@/types";

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  { name: "Finance", icon: "💳", color: "#10B981", order: 0 },
  { name: "Email", icon: "📧", color: "#3B82F6", order: 1 },
  { name: "Work", icon: "💼", color: "#8B5CF6", order: 2 },
  { name: "Entertainment", icon: "🎮", color: "#EC4899", order: 3 },
  { name: "Shopping", icon: "🛒", color: "#F59E0B", order: 4 },
  { name: "Social", icon: "🌐", color: "#06B6D4", order: 5 },
];

const confirmVerificationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  code: z.string().length(6, "Code must be 6 digits"),
});

type ConfirmVerificationRequest = z.infer<typeof confirmVerificationSchema>;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for verification attempts
    const ip = getClientIp(request);
    const rateLimitKey = `verify-confirm:${ip}`;
    const { allowed, error: rateLimitError } = await checkRateLimit(
      rateLimitKey,
      "mfa", // Use MFA rate limit (5 attempts per 5 minutes)
    );

    if (!allowed) {
      return rateLimitError!;
    }

    // Parse and validate request body
    const { data, error: parseError } =
      await parseBody<ConfirmVerificationRequest>(
        request,
        confirmVerificationSchema,
      );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Find the verification token
    const verificationToken = await EmailVerificationTokenModel.findOne({
      token: data!.token,
    });

    if (!verificationToken) {
      return errorResponse(
        "INVALID_TOKEN",
        "Invalid or expired verification token",
        400,
      );
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      await EmailVerificationTokenModel.deleteOne({ token: data!.token });
      return errorResponse(
        "TOKEN_EXPIRED",
        "Verification token has expired. Please request a new one.",
        400,
      );
    }

    // Verify the code
    if (verificationToken.code !== data!.code) {
      return errorResponse("INVALID_CODE", "Invalid verification code", 400);
    }

    // Check if already verified (prevent double registration)
    if (verificationToken.verified) {
      return errorResponse(
        "ALREADY_VERIFIED",
        "This email has already been verified",
        400,
      );
    }

    // Check registration data exists
    if (!verificationToken.registrationData) {
      return errorResponse("INVALID_TOKEN", "Registration data not found", 400);
    }

    const { name, authHash, salt, encryptedVaultKey } =
      verificationToken.registrationData;

    // Double-check user doesn't exist (race condition protection)
    const existingUser = await UserModel.findOne({
      email: verificationToken.email,
    });

    if (existingUser) {
      await EmailVerificationTokenModel.deleteOne({ token: data!.token });
      return errorResponse(
        "EMAIL_EXISTS",
        "An account with this email already exists",
        409,
      );
    }

    // Hash the auth hash (additional server-side security)
    const serverAuthHash = await hashAuthHash(authHash);

    // Generate recovery key
    const recoveryKey = generateRecoveryKey();
    const recoveryKeyHash = await hashString(recoveryKey);

    // Create user with verified email
    const user = await UserModel.create({
      email: verificationToken.email,
      name,
      authHash: serverAuthHash,
      authSalt: salt,
      authProvider: "credentials",
      encryptedVaultKey,
      recoveryKeyHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      settings: {
        theme: "system",
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        autoLockMinutes: 15,
        clearClipboardSeconds: 30,
        showPasswordStrength: true,
        emailOnNewLogin: true,
        emailOnPasswordChange: true,
        emailSecurityAlerts: true,
        defaultView: "grid",
        defaultSort: "name",
        showFavicons: true,
      },
    });

    // Create default categories
    const categoryDocs = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId: user._id.toString(),
      isDefault: true,
      isLocked: false,
    }));

    await CategoryModel.insertMany(categoryDocs);

    // Mark token as verified and delete it
    await EmailVerificationTokenModel.deleteOne({ token: data!.token });

    // Generate tokens
    const userId = user._id.toString();
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(userId, user.email),
      generateRefreshToken(userId, user.email),
    ]);

    // Log the registration
    await logAudit(userId, "login", request, {
      resourceType: "user",
      resourceId: userId,
      metadata: { type: "registration", emailVerified: true },
    });

    // Prepare public user data
    const userPublic: UserPublic = {
      _id: userId,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      mfaEnabled: user.mfaEnabled,
      settings: user.settings,
      createdAt: user.createdAt,
    };

    return successResponse(
      {
        user: userPublic,
        accessToken,
        refreshToken,
        recoveryKey, // Only returned once at registration!
        salt,
        encryptedVaultKey,
      },
      201,
    );
  } catch (error) {
    console.error("Confirm verification error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
