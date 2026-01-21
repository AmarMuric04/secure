/**
 * Delete All User Passwords API (Development Only!)
 * DELETE /api/dev/delete-all-passwords
 *
 * WARNING: This is a dangerous operation. Only enable in development!
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PasswordEntryModel } from "@/lib/db/models";
import {
  authenticateRequest,
  successResponse,
  errorResponse,
} from "@/lib/api/utils";

export async function DELETE(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return errorResponse(
      "FORBIDDEN",
      "This endpoint is not available in production",
      403,
    );
  }

  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Count passwords before deleting
    const count = await PasswordEntryModel.countDocuments({
      userId: auth.userId,
    });

    if (count === 0) {
      return successResponse({
        message: "No passwords to delete",
        deletedCount: 0,
      });
    }

    // Delete all passwords for this user
    const result = await PasswordEntryModel.deleteMany({
      userId: auth.userId,
    });

    console.log(
      `[DEV] Deleted ${result.deletedCount} passwords for user ${auth.userId}`,
    );

    return successResponse({
      message: `Successfully deleted ${result.deletedCount} password(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete passwords error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
