/**
 * Token Refresh API
 * POST /api/auth/refresh
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel, SessionModel } from "@/lib/db/models";
import { refreshSchema } from "@/lib/validations";
import {
  verifyRefreshToken,
  verifyString,
  generateAccessToken,
  generateRefreshToken,
  hashString,
} from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  parseBody,
  getDeviceInfo,
} from "@/lib/api/utils";
import type { RefreshRequest, RefreshResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const { data, error: parseError } = await parseBody<RefreshRequest>(
      request,
      refreshSchema,
    );

    if (parseError) {
      return parseError;
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(data.refreshToken);

    if (!payload) {
      return errorResponse(
        "INVALID_TOKEN",
        "Invalid or expired refresh token",
        401,
      );
    }

    await connectDB();

    // Find user
    const user = await UserModel.findById(payload.sub);

    if (!user || user.status !== "active") {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    // Find and validate session
    const sessions = await SessionModel.find({
      userId: payload.sub,
      expiresAt: { $gt: new Date() },
    });

    let validSession = null;
    for (const session of sessions) {
      const isValid = await verifyString(
        data.refreshToken,
        session.refreshTokenHash,
      );
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      return errorResponse(
        "SESSION_EXPIRED",
        "Session expired or invalid",
        401,
      );
    }

    const userId = user._id.toString();

    // Generate new tokens (token rotation)
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(userId, user.email),
      generateRefreshToken(userId, user.email),
    ]);

    // Update session with new refresh token
    const deviceInfo = getDeviceInfo(request);
    const refreshTokenHash = await hashString(refreshToken);

    await SessionModel.updateOne(
      { _id: validSession._id },
      {
        refreshTokenHash,
        deviceInfo,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    );

    // Update user's last active time
    await UserModel.updateOne({ _id: user._id }, { lastActiveAt: new Date() });

    const response: RefreshResponse = {
      accessToken,
      refreshToken,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Token refresh error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
