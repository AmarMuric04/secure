/**
 * Restore Password from Trash API
 * POST /api/vault/passwords/[id]/restore
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PasswordEntryModel } from "@/lib/db/models";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";
import type { PasswordEntry } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Find and restore password entry
    const updatedEntry = await PasswordEntryModel.findOneAndUpdate(
      {
        _id: id,
        userId: auth.userId,
        deletedAt: { $ne: null }, // Must be in trash
      },
      { deletedAt: null },
      { new: true },
    ).lean();

    if (!updatedEntry) {
      return errorResponse(
        "NOT_FOUND",
        "Password entry not found in trash",
        404,
      );
    }

    // Log the restore
    await logAudit(auth.userId, "password_updated", request, {
      resourceType: "password",
      resourceId: id,
      metadata: { action: "restore" },
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
    console.error("Password restore error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
