/**
 * Single Category Management APIs
 * GET /api/vault/categories/[id] - Get category
 * PUT /api/vault/categories/[id] - Update category
 * DELETE /api/vault/categories/[id] - Delete category
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { CategoryModel, PasswordEntryModel } from "@/lib/db/models";
import { updateCategorySchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
} from "@/lib/api/utils";
import type { UpdateCategoryInput } from "@/lib/validations";
import type { Category } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Get a single category
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

    // Find category
    const category = await CategoryModel.findOne({
      _id: id,
      userId: auth.userId,
    }).lean();

    if (!category) {
      return errorResponse("NOT_FOUND", "Category not found", 404);
    }

    // Get password count
    const passwordCount = await PasswordEntryModel.countDocuments({
      userId: auth.userId,
      categoryId: id,
      deletedAt: null,
    });

    // Transform to response format
    const response: Category & { passwordCount: number } = {
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
      passwordCount,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Category fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Update a category
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
    const { data, error: parseError } = await parseBody<UpdateCategoryInput>(
      request,
      updateCategorySchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Check if category exists and is not locked
    const existingCategory = await CategoryModel.findOne({
      _id: id,
      userId: auth.userId,
    });

    if (!existingCategory) {
      return errorResponse("NOT_FOUND", "Category not found", 404);
    }

    if (existingCategory.isLocked) {
      return errorResponse("LOCKED", "This category cannot be modified", 403);
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.order !== undefined) updateData.order = data.order;

    // Update the category
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).lean();

    if (!updatedCategory) {
      return errorResponse("NOT_FOUND", "Category not found", 404);
    }

    // Transform to response format
    const response: Category = {
      _id: updatedCategory._id.toString(),
      userId: updatedCategory.userId,
      name: updatedCategory.name,
      icon: updatedCategory.icon,
      color: updatedCategory.color,
      parentId: updatedCategory.parentId,
      order: updatedCategory.order,
      isDefault: updatedCategory.isDefault,
      isLocked: updatedCategory.isLocked,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Category update error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}

/**
 * Delete a category
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

    // Check if category exists and is not locked/default
    const category = await CategoryModel.findOne({
      _id: id,
      userId: auth.userId,
    });

    if (!category) {
      return errorResponse("NOT_FOUND", "Category not found", 404);
    }

    if (category.isLocked || category.isDefault) {
      return errorResponse("LOCKED", "This category cannot be deleted", 403);
    }

    // Check for move target
    const { searchParams } = new URL(request.url);
    const moveToCategory = searchParams.get("moveTo");

    if (moveToCategory) {
      // Move passwords to another category
      await PasswordEntryModel.updateMany(
        { userId: auth.userId, categoryId: id },
        { categoryId: moveToCategory },
      );
    } else {
      // Remove category from passwords
      await PasswordEntryModel.updateMany(
        { userId: auth.userId, categoryId: id },
        { $unset: { categoryId: "" } },
      );
    }

    // Delete the category
    await CategoryModel.deleteOne({ _id: id });

    return successResponse({ message: "Category deleted" });
  } catch (error) {
    console.error("Category delete error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
