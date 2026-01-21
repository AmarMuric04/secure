/**
 * Change Master Password API
 * PUT /api/user/password
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel, SessionModel } from "@/lib/db/models";
import { changePasswordSchema } from "@/lib/validations";
import { verifyAuthHash, hashAuthHash } from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";
import type { ChangePasswordInput } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<ChangePasswordInput>(
      request,
      changePasswordSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Find user and verify current password
    const user = await UserModel.findById(auth.userId);

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    // Verify current password
    const isValid = await verifyAuthHash(data.currentAuthHash, user.authHash);

    if (!isValid) {
      return errorResponse(
        "INVALID_PASSWORD",
        "Current password is incorrect",
        401,
      );
    }

    // Hash new password
    const newAuthHash = await hashAuthHash(data.newAuthHash);

    // Update user
    const updateData: Record<string, unknown> = {
      authHash: newAuthHash,
      authSalt: data.newSalt,
      encryptedVaultKey: data.reEncryptedVaultKey,
    };

    if (data.reEncryptedRecoveryData) {
      updateData.encryptedRecoveryData = data.reEncryptedRecoveryData;
    }

    await UserModel.updateOne({ _id: auth.userId }, updateData);

    // Invalidate all other sessions (security measure)
    const currentSession = await SessionModel.findOne({
      userId: auth.userId,
    })
      .sort({ lastActiveAt: -1 })
      .select("_id");

    if (currentSession) {
      await SessionModel.deleteMany({
        userId: auth.userId,
        _id: { $ne: currentSession._id },
      });
    }

    // Log the action
    await logAudit(auth.userId, "settings_changed", request, {
      resourceType: "user",
      resourceId: auth.userId,
      metadata: { action: "password_change", sessionsRevoked: true },
    });

    return successResponse({
      message:
        "Password changed successfully. All other sessions have been revoked.",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
