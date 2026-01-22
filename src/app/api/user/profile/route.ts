/**
 * User Profile API
 * GET /api/user/profile - Get user profile
 * PUT /api/user/profile - Update user profile
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models";
import { userSettingsSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";
import type { UserPublic } from "@/types";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  settings: userSettingsSchema.optional(),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Find user
    const user = await UserModel.findById(auth.userId).lean();

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    // Transform to public format
    const response: UserPublic = {
      _id: user._id.toString(),
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      avatarUrl: user.avatarUrl,
      mfaEnabled: user.mfaEnabled,
      settings: user.settings,
      createdAt: user.createdAt,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<UpdateProfileInput>(
      request,
      updateProfileSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.settings) {
      // Merge settings
      const user = await UserModel.findById(auth.userId)
        .select("settings")
        .lean();
      if (user) {
        updateData.settings = { ...user.settings, ...data.settings };
      }
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      auth.userId,
      updateData,
      { new: true },
    ).lean();

    if (!updatedUser) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    // Log settings change
    if (data.settings) {
      await logAudit(auth.userId, "settings_changed", request, {
        resourceType: "user",
        resourceId: auth.userId,
        metadata: { changedFields: Object.keys(data.settings) },
      });
    }

    // Transform to public format
    const response: UserPublic = {
      _id: updatedUser._id.toString(),
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      mfaEnabled: updatedUser.mfaEnabled,
      settings: updatedUser.settings,
      createdAt: updatedUser.createdAt,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Profile update error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Delete current user's account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Import models for cascading delete
    const { PasswordEntryModel, CategoryModel, SessionModel, AuditLogModel } =
      await import("@/lib/db/models");

    // Delete all user data in parallel
    await Promise.all([
      // Delete all passwords
      PasswordEntryModel.deleteMany({ userId: auth.userId }),
      // Delete all categories
      CategoryModel.deleteMany({ userId: auth.userId }),
      // Delete all sessions
      SessionModel.deleteMany({ userId: auth.userId }),
      // Delete all audit logs
      AuditLogModel.deleteMany({ userId: auth.userId }),
    ]);

    // Log the account deletion before deleting the user
    await logAudit(auth.userId, "account_deleted", request, {
      resourceType: "user",
      resourceId: auth.userId,
    });

    // Delete the user
    await UserModel.findByIdAndDelete(auth.userId);

    return successResponse({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
