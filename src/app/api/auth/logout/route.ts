/**
 * Logout API
 * POST /api/auth/logout
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SessionModel } from "@/lib/db/models";
import { verifyString } from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Get refresh token from body (optional - for specific session logout)
    let refreshToken: string | undefined;
    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {
      // No body or invalid JSON is fine
    }

    if (refreshToken) {
      // Logout specific session
      const sessions = await SessionModel.find({ userId: auth.userId });

      for (const session of sessions) {
        const isMatch = await verifyString(
          refreshToken,
          session.refreshTokenHash,
        );
        if (isMatch) {
          await SessionModel.deleteOne({ _id: session._id });
          break;
        }
      }
    } else {
      // Logout all sessions for this user
      await SessionModel.deleteMany({ userId: auth.userId });
    }

    // Log the logout
    await logAudit(auth.userId, "logout", request, {
      resourceType: "session",
      metadata: { logoutAll: !refreshToken },
    });

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
