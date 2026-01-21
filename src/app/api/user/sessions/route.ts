/**
 * Session Management API
 * GET /api/user/sessions - List active sessions
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

interface SessionResponse {
  _id: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    country?: string;
    city?: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
  isCurrent: boolean;
}

/**
 * List all active sessions
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Fetch active sessions
    const sessions = await SessionModel.find({
      userId: auth.userId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastActiveAt: -1 })
      .lean();

    // Get current session ID from token (if available)
    // For now, we mark the most recently active session as current
    const currentSessionId =
      sessions.length > 0 ? sessions[0]._id.toString() : null;

    // Transform to response format
    const items: SessionResponse[] = sessions.map((s) => ({
      _id: s._id.toString(),
      deviceInfo: s.deviceInfo,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s._id.toString() === currentSessionId,
    }));

    return successResponse(items);
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Revoke all other sessions
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Get the most recent session (current session)
    const currentSession = await SessionModel.findOne({
      userId: auth.userId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastActiveAt: -1 })
      .select("_id");

    if (currentSession) {
      // Delete all sessions except current
      await SessionModel.deleteMany({
        userId: auth.userId,
        _id: { $ne: currentSession._id },
      });
    }

    // Log the action
    await logAudit(auth.userId, "session_revoked", request, {
      resourceType: "session",
      metadata: { action: "revoke_all_others" },
    });

    return successResponse({ message: "All other sessions revoked" });
  } catch (error) {
    console.error("Sessions revoke error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
