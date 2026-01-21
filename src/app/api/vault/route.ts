/**
 * Vault API - Get entire vault
 * GET /api/vault
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PasswordEntryModel, CategoryModel, UserModel } from "@/lib/db/models";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
} from "@/lib/api/utils";
import type { VaultResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Build query
    const passwordQuery: Record<string, unknown> = { userId: auth.userId };

    if (!includeDeleted) {
      passwordQuery.deletedAt = null;
    }

    // Fetch all data in parallel
    const [passwords, categories, user] = await Promise.all([
      PasswordEntryModel.find(passwordQuery).sort({ updatedAt: -1 }).lean(),
      CategoryModel.find({ userId: auth.userId }).sort({ order: 1 }).lean(),
      UserModel.findById(auth.userId).select("lastActiveAt").lean(),
    ]);

    // Extract unique tags
    const tagsSet = new Set<string>();
    passwords.forEach((p) => {
      p.tags.forEach((tag: string) => tagsSet.add(tag));
    });

    // Update last active
    await UserModel.updateOne(
      { _id: auth.userId },
      { lastActiveAt: new Date() },
    );

    // Transform to response format
    const response: VaultResponse = {
      passwords: passwords.map((p) => ({
        _id: p._id.toString(),
        userId: p.userId,
        encryptedData: p.encryptedData,
        iv: p.iv,
        categoryId: p.categoryId,
        tags: p.tags,
        favorite: p.favorite,
        passwordStrength: p.passwordStrength,
        isCompromised: p.isCompromised,
        isReused: p.isReused,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        lastUsedAt: p.lastUsedAt,
        passwordChangedAt: p.passwordChangedAt,
        deletedAt: p.deletedAt,
        encryptionVersion: p.encryptionVersion,
      })),
      categories: categories.map((c) => ({
        _id: c._id.toString(),
        userId: c.userId,
        name: c.name,
        icon: c.icon,
        color: c.color,
        parentId: c.parentId,
        order: c.order,
        isDefault: c.isDefault,
        isLocked: c.isLocked,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      tags: Array.from(tagsSet).sort(),
      lastModified: user?.lastActiveAt || new Date(),
      version: 1,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Vault fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
