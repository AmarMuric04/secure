/**
 * Single Password Management APIs
 * GET /api/vault/passwords/[id] - Get password
 * PUT /api/vault/passwords/[id] - Update password
 * DELETE /api/vault/passwords/[id] - Soft delete password
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PasswordEntryModel } from "@/lib/db/models";
import { updatePasswordSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";
import type { UpdatePasswordRequest, PasswordEntry } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Get a single password entry
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Find password entry
    const passwordEntry = await PasswordEntryModel.findOne({
      _id: id,
      userId: auth.userId,
    }).lean();

    if (!passwordEntry) {
      return errorResponse("NOT_FOUND", "Password entry not found", 404);
    }

    // Log the view
    await logAudit(auth.userId, "password_viewed", request, {
      resourceType: "password",
      resourceId: id,
    });

    // Update last used
    await PasswordEntryModel.updateOne({ _id: id }, { lastUsedAt: new Date() });

    // Transform to response format
    const response: PasswordEntry = {
      _id: passwordEntry._id.toString(),
      userId: passwordEntry.userId,
      encryptedData: passwordEntry.encryptedData,
      iv: passwordEntry.iv,
      categoryId: passwordEntry.categoryId,
      tags: passwordEntry.tags,
      favorite: passwordEntry.favorite,
      passwordStrength: passwordEntry.passwordStrength,
      isCompromised: passwordEntry.isCompromised,
      isReused: passwordEntry.isReused,
      createdAt: passwordEntry.createdAt,
      updatedAt: passwordEntry.updatedAt,
      lastUsedAt: new Date(), // Updated just now
      passwordChangedAt: passwordEntry.passwordChangedAt,
      deletedAt: passwordEntry.deletedAt,
      encryptionVersion: passwordEntry.encryptionVersion,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Password fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Update a password entry
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<UpdatePasswordRequest>(
      request,
      updatePasswordSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Find and update password entry
    const existingEntry = await PasswordEntryModel.findOne({
      _id: id,
      userId: auth.userId,
      deletedAt: null,
    });

    if (!existingEntry) {
      return errorResponse("NOT_FOUND", "Password entry not found", 404);
    }

    // Check if password data changed (to update passwordChangedAt)
    const passwordChanged = existingEntry.encryptedData !== data.encryptedData;

    // Update the entry
    const updateData: Record<string, unknown> = {
      encryptedData: data.encryptedData,
      iv: data.iv,
      categoryId: data.metadata.categoryId,
      tags: data.metadata.tags,
      favorite: data.metadata.favorite,
      passwordStrength: data.metadata.passwordStrength,
      isCompromised: data.metadata.isCompromised,
      isReused: data.metadata.isReused,
    };

    if (passwordChanged) {
      updateData.passwordChangedAt = new Date();
    }

    const updatedEntry = await PasswordEntryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).lean();

    if (!updatedEntry) {
      return errorResponse("NOT_FOUND", "Password entry not found", 404);
    }

    // Log the update
    await logAudit(auth.userId, "password_updated", request, {
      resourceType: "password",
      resourceId: id,
      metadata: { passwordChanged },
    });

    // Transform to response format
    const response: PasswordEntry = {
      _id: updatedEntry._id.toString(),
      userId: updatedEntry.userId,
      encryptedData: updatedEntry.encryptedData,
      iv: updatedEntry.iv,
      categoryId: updatedEntry.categoryId,
      tags: updatedEntry.tags,
      favorite: updatedEntry.favorite,
      passwordStrength: updatedEntry.passwordStrength,
      isCompromised: updatedEntry.isCompromised,
      isReused: updatedEntry.isReused,
      createdAt: updatedEntry.createdAt,
      updatedAt: updatedEntry.updatedAt,
      lastUsedAt: updatedEntry.lastUsedAt,
      passwordChangedAt: updatedEntry.passwordChangedAt,
      deletedAt: updatedEntry.deletedAt,
      encryptionVersion: updatedEntry.encryptionVersion,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Password update error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Partial update a password entry (alias for PUT)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params });
}

/**
 * Soft delete a password entry (move to trash)
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

    // Check if permanent delete
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Permanent delete
      const result = await PasswordEntryModel.deleteOne({
        _id: id,
        userId: auth.userId,
      });

      if (result.deletedCount === 0) {
        return errorResponse("NOT_FOUND", "Password entry not found", 404);
      }

      await logAudit(auth.userId, "password_deleted", request, {
        resourceType: "password",
        resourceId: id,
        metadata: { permanent: true },
      });

      return successResponse({ message: "Password permanently deleted" });
    } else {
      // Soft delete (move to trash)
      const result = await PasswordEntryModel.updateOne(
        {
          _id: id,
          userId: auth.userId,
          deletedAt: null,
        },
        { deletedAt: new Date() },
      );

      if (result.matchedCount === 0) {
        return errorResponse("NOT_FOUND", "Password entry not found", 404);
      }

      await logAudit(auth.userId, "password_deleted", request, {
        resourceType: "password",
        resourceId: id,
        metadata: { permanent: false },
      });

      return successResponse({ message: "Password moved to trash" });
    }
  } catch (error) {
    console.error("Password delete error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
