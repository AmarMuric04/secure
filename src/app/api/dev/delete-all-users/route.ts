/**
 * Delete All Users API (Development Only!)
 * DELETE /api/dev/delete-all-users
 *
 * WARNING: This is a dangerous operation. Only enable in development!
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import {
  UserModel,
  PasswordEntryModel,
  CategoryModel,
  SessionModel,
  AuditLogModel,
  EmailVerificationTokenModel,
} from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/api/utils";

export async function DELETE(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return errorResponse(
      "FORBIDDEN",
      "This endpoint is not available in production",
      403,
    );
  }

  // Require a secret key to prevent accidental calls
  const { searchParams } = new URL(request.url);
  const confirmKey = searchParams.get("confirm");

  if (confirmKey !== "DELETE_ALL_USERS") {
    return errorResponse(
      "CONFIRMATION_REQUIRED",
      "Add ?confirm=DELETE_ALL_USERS to confirm this dangerous operation",
      400,
    );
  }

  try {
    await connectDB();

    // Delete everything
    const [
      usersDeleted,
      passwordsDeleted,
      categoriesDeleted,
      sessionsDeleted,
      auditLogsDeleted,
      verificationTokensDeleted,
    ] = await Promise.all([
      UserModel.deleteMany({}),
      PasswordEntryModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      SessionModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      EmailVerificationTokenModel.deleteMany({}),
    ]);

    console.log("🗑️ Deleted all users and related data");

    return successResponse({
      message: "All users and related data deleted",
      deleted: {
        users: usersDeleted.deletedCount,
        passwords: passwordsDeleted.deletedCount,
        categories: categoriesDeleted.deletedCount,
        sessions: sessionsDeleted.deletedCount,
        auditLogs: auditLogsDeleted.deletedCount,
        verificationTokens: verificationTokensDeleted.deletedCount,
      },
    });
  } catch (error) {
    console.error("Delete all users error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
