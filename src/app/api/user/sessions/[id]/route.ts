/**
 * Single Session Management API
 * DELETE /api/user/sessions/[id] - Revoke specific session
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SessionModel } from "@/lib/db/models";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Revoke a specific session
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Delete the session
    const result = await SessionModel.deleteOne({
      _id: id,
      userId: auth.userId,
    });

    if (result.deletedCount === 0) {
      return errorResponse("NOT_FOUND", "Session not found", 404);
    }

    // Log the action
    await logAudit(auth.userId, "session_revoked", request, {
      resourceType: "session",
      resourceId: id,
    });

    return successResponse({ message: "Session revoked" });
  } catch (error) {
    console.error("Session revoke error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
