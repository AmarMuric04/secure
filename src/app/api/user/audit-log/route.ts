/**
 * Audit Log API
 * GET /api/user/audit-log - Get user's audit log
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { AuditLogModel } from "@/lib/db/models";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
} from "@/lib/api/utils";
import type { AuditLog, AuditAction } from "@/types";

interface AuditLogResponse {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

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

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "50")),
    );
    const action = searchParams.get("action") as AuditAction | null;
    const resourceType = searchParams.get("resourceType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query: Record<string, unknown> = { userId: auth.userId };

    if (action) {
      query.action = action;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * pageSize;

    // Fetch audit logs
    const [logs, total] = await Promise.all([
      AuditLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      AuditLogModel.countDocuments(query),
    ]);

    // Transform to response format
    const items: AuditLog[] = logs.map((log) => ({
      _id: log._id.toString(),
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      geoLocation: log.geoLocation,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }));

    const response: AuditLogResponse = {
      items,
      total,
      page,
      pageSize,
      hasMore: skip + items.length < total,
    };

    return successResponse(response);
  } catch (error) {
    console.error("Audit log fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
