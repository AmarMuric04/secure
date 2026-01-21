/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel, CategoryModel } from "@/lib/db/models";
import { registerSchema } from "@/lib/validations";
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
import type { UserPublic, RegisterRequest } from "@/types";

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  { name: "Finance", icon: "💳", color: "#10B981", order: 0 },
  { name: "Email", icon: "📧", color: "#3B82F6", order: 1 },
  { name: "Work", icon: "💼", color: "#8B5CF6", order: 2 },
  { name: "Entertainment", icon: "🎮", color: "#EC4899", order: 3 },
  { name: "Shopping", icon: "🛒", color: "#F59E0B", order: 4 },
  { name: "Social", icon: "🌐", color: "#06B6D4", order: 5 },
];

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitKey = `register:${ip}`;
    const { allowed, error: rateLimitError } = await checkRateLimit(
      rateLimitKey,
      "register",
    );

    if (!allowed) {
      return rateLimitError!;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<RegisterRequest>(
      request,
      registerSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: data!.email });

    if (existingUser) {
      return errorResponse(
        "EMAIL_EXISTS",
        "An account with this email already exists",
        409,
      );
    }

    // Hash the auth hash (additional server-side security)
    const serverAuthHash = await hashAuthHash(data!.authHash);

    // Generate recovery key
    const recoveryKey = generateRecoveryKey();
    const recoveryKeyHash = await hashString(recoveryKey);

    // Create user
    const user = await UserModel.create({
      email: data!.email,
      name: data!.name,
      authHash: serverAuthHash,
      authSalt: data!.salt,
      encryptedVaultKey: data!.encryptedVaultKey,
      recoveryKeyHash,
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
      metadata: { type: "registration" },
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
        salt: data.salt,
        encryptedVaultKey: data.encryptedVaultKey,
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
