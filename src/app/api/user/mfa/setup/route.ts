/**
 * MFA Setup API
 * GET /api/user/mfa/setup - Get TOTP setup data
 * POST /api/user/mfa/setup - Enable MFA
 * DELETE /api/user/mfa - Disable MFA
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models";
import { mfaSetupSchema } from "@/lib/validations";
import {
  generateTotpSecret,
  verifyTotpCode,
  generateBackupCodes,
  hashString,
} from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";
import type { MfaSetupInput } from "@/lib/validations";

/**
 * Get TOTP setup data (secret and QR code URL)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Check if MFA is already enabled
    const user = await UserModel.findById(auth.userId)
      .select("email mfaEnabled")
      .lean();

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    if (user.mfaEnabled) {
      return errorResponse("ALREADY_ENABLED", "MFA is already enabled", 400);
    }

    // Generate new TOTP secret
    const secret = generateTotpSecret();

    // Generate otpauth URL for QR code
    const issuer = "SecureVault";
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

    return successResponse({
      secret,
      otpauthUrl,
      // Client should generate QR code from otpauthUrl
    });
  } catch (error) {
    console.error("MFA setup fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Enable MFA (verify code and save)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<MfaSetupInput>(
      request,
      mfaSetupSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Check if MFA is already enabled
    const user = await UserModel.findById(auth.userId)
      .select("mfaEnabled")
      .lean();

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    if (user.mfaEnabled) {
      return errorResponse("ALREADY_ENABLED", "MFA is already enabled", 400);
    }

    // Verify the code with the provided secret
    const isValid = verifyTotpCode(data.secret, data.code);

    if (!isValid) {
      return errorResponse("INVALID_CODE", "Invalid verification code", 400);
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => hashString(code)),
    );

    // Enable MFA
    await UserModel.updateOne(
      { _id: auth.userId },
      {
        mfaEnabled: true,
        mfaSecret: data.secret,
        mfaBackupCodes: hashedBackupCodes,
      },
    );

    // Log the action
    await logAudit(auth.userId, "mfa_enabled", request, {
      resourceType: "user",
      resourceId: auth.userId,
    });

    return successResponse({
      message: "MFA enabled successfully",
      backupCodes, // Only shown once!
    });
  } catch (error) {
    console.error("MFA enable error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Disable MFA
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Check if MFA is enabled
    const user = await UserModel.findById(auth.userId)
      .select("mfaEnabled")
      .lean();

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    if (!user.mfaEnabled) {
      return errorResponse("NOT_ENABLED", "MFA is not enabled", 400);
    }

    // Disable MFA
    await UserModel.updateOne(
      { _id: auth.userId },
      {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    );

    // Log the action
    await logAudit(auth.userId, "mfa_disabled", request, {
      resourceType: "user",
      resourceId: auth.userId,
    });

    return successResponse({ message: "MFA disabled successfully" });
  } catch (error) {
    console.error("MFA disable error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
