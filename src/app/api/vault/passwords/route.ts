/**
 * Password Management APIs
 * POST /api/vault/passwords - Create password
 * GET /api/vault/passwords - List passwords (with filtering)
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PasswordEntryModel } from "@/lib/db/models";
import { createPasswordSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  logAudit,
} from "@/lib/api/utils";
import type { CreatePasswordRequest, PasswordEntry } from "@/types";

/**
 * Create a new password entry
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<CreatePasswordRequest>(
      request,
      createPasswordSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Create password entry
    const now = new Date();
    const passwordEntry = await PasswordEntryModel.create({
      userId: auth.userId,
      encryptedData: data.encryptedData,
      iv: data.iv,
      categoryId: data.metadata.categoryId,
      tags: data.metadata.tags,
      favorite: data.metadata.favorite,
      passwordStrength: data.metadata.passwordStrength,
      isCompromised: data.metadata.isCompromised,
      isReused: data.metadata.isReused,
      passwordChangedAt: now,
      encryptionVersion: 1,
    });

    // Log the creation
    await logAudit(auth.userId, "password_created", request, {
      resourceType: "password",
      resourceId: passwordEntry._id.toString(),
    });

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
      lastUsedAt: passwordEntry.lastUsedAt,
      passwordChangedAt: passwordEntry.passwordChangedAt,
      deletedAt: passwordEntry.deletedAt,
      encryptionVersion: passwordEntry.encryptionVersion,
    };

    return successResponse({ password: response }, 201);
  } catch (error) {
    console.error("Password creation error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * List password entries with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const favorite = searchParams.get("favorite");
    const tag = searchParams.get("tag");
    const isWeak = searchParams.get("isWeak");
    const isReused = searchParams.get("isReused");
    const isCompromised = searchParams.get("isCompromised");
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const query: Record<string, unknown> = { userId: auth.userId };

    if (!includeDeleted) {
      query.deletedAt = null;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (favorite === "true") {
      query.favorite = true;
    }

    if (tag) {
      query.tags = tag;
    }

    if (isWeak === "true") {
      query.passwordStrength = { $lte: 1 };
    }

    if (isReused === "true") {
      query.isReused = true;
    }

    if (isCompromised === "true") {
      query.isCompromised = true;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    const validSortFields = [
      "name",
      "createdAt",
      "updatedAt",
      "lastUsedAt",
      "passwordStrength",
    ];
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder;
    } else {
      sort.updatedAt = -1;
    }

    // Fetch passwords
    const [passwords, total] = await Promise.all([
      PasswordEntryModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      PasswordEntryModel.countDocuments(query),
    ]);

    // Transform to response format
    const items: PasswordEntry[] = passwords.map((p) => ({
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
    }));

    return successResponse({
      items,
      total,
      skip,
      limit,
      hasMore: skip + items.length < total,
    });
  } catch (error) {
    console.error("Password list error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
