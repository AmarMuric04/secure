/**
 * Category Management APIs
 * GET /api/vault/categories - List categories
 * POST /api/vault/categories - Create category
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { CategoryModel } from "@/lib/db/models";
import { createCategorySchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
} from "@/lib/api/utils";
import type { CreateCategoryInput } from "@/lib/validations";
import type { Category } from "@/types";

/**
 * List all categories
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    await connectDB();

    // Fetch categories
    const categories = await CategoryModel.find({ userId: auth.userId })
      .sort({ order: 1 })
      .lean();

    // Transform to response format
    const items: Category[] = categories.map((c) => ({
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
    }));

    return successResponse(items);
  } catch (error) {
    console.error("Category list error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Parse and validate request body
    const { data, error: parseError } = await parseBody<CreateCategoryInput>(
      request,
      createCategorySchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Get highest order number
    const lastCategory = await CategoryModel.findOne({ userId: auth.userId })
      .sort({ order: -1 })
      .select("order")
      .lean();

    const nextOrder = (lastCategory?.order ?? -1) + 1;

    // Create category
    const category = await CategoryModel.create({
      userId: auth.userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      parentId: data.parentId,
      order: nextOrder,
      isDefault: false,
      isLocked: false,
    });

    // Transform to response format
    const response: Category = {
      _id: category._id.toString(),
      userId: category.userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      parentId: category.parentId,
      order: category.order,
      isDefault: category.isDefault,
      isLocked: category.isLocked,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error("Category creation error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
