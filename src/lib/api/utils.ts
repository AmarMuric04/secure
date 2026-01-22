/**
 * API Utilities and Middleware
 * Common functions for API route handlers
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { RateLimitModel, AuditLogModel } from "@/lib/db/models";
import type { ApiResponse, AuditAction } from "@/types";

// ============================================================================
// Response Helpers
// ============================================================================

export function successResponse<T>(
  data: T,
  status: number = 200,
): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, {
    status,
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    } satisfies ApiResponse,
    { status },
  );
}

// ============================================================================
// Request Parsing
// ============================================================================

export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      const zodErr = err as ZodError;
      return {
        data: null,
        error: errorResponse(
          "VALIDATION_ERROR",
          "Invalid request data",
          400,
          zodErr.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        ),
      };
    }
    return {
      data: null,
      error: errorResponse("PARSE_ERROR", "Invalid JSON body", 400),
    };
  }
}

// ============================================================================
// Authentication Middleware
// ============================================================================

export interface AuthenticatedRequest {
  userId: string;
  email: string;
}

export async function authenticateRequest(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
): Promise<
  | { auth: AuthenticatedRequest; error: null }
  | { auth: null; error: NextResponse }
> {
  // Use NextAuth's auth() function to get the session
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return {
      auth: null,
      error: errorResponse("UNAUTHORIZED", "Not authenticated", 401),
    };
  }

  return {
    auth: {
      userId: session.user.id,
      email: session.user.email,
    },
    error: null,
  };
}

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    blockDurationMs: 30 * 60 * 1000,
  },
  register: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 24 * 60 * 60 * 1000,
  },
  mfa: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 30 * 60 * 1000,
  },
  api: { windowMs: 60 * 1000, maxRequests: 100, blockDurationMs: 60 * 1000 },
  export: {
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 3,
    blockDurationMs: 24 * 60 * 60 * 1000,
  },
};

export async function checkRateLimit(
  key: string,
  type: keyof typeof RATE_LIMITS,
): Promise<{ allowed: boolean; error: NextResponse | null }> {
  await connectDB();

  const config = RATE_LIMITS[type];
  const now = new Date();

  const rateLimit = await RateLimitModel.findOne({ key });
  return Promise.resolve({
    allowed: true,
    error: null,
  });

  if (rateLimit) {
    // Check if blocked
    if (rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
      const retryAfter = Math.ceil(
        (rateLimit.blockedUntil.getTime() - now.getTime()) / 1000,
      );
      return {
        allowed: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Too many requests. Please try again later.",
              details: { retryAfter },
            },
          } satisfies ApiResponse,
          {
            status: 429,
            headers: { "Retry-After": retryAfter.toString() },
          },
        ),
      };
    }

    // Check if within window
    const windowStart = new Date(now.getTime() - config.windowMs);
    if (rateLimit.firstAttempt > windowStart) {
      if (rateLimit.count >= config.maxRequests) {
        // Block the key
        await RateLimitModel.updateOne(
          { key },
          { blockedUntil: new Date(now.getTime() + config.blockDurationMs) },
        );
        return {
          allowed: false,
          error: errorResponse(
            "RATE_LIMITED",
            "Too many requests. Please try again later.",
            429,
          ),
        };
      }

      // Increment count
      await RateLimitModel.updateOne({ key }, { $inc: { count: 1 } });
    } else {
      // Reset counter (new window)
      await RateLimitModel.updateOne(
        { key },
        { count: 1, firstAttempt: now, blockedUntil: null },
      );
    }
  } else {
    // Create new rate limit entry
    await RateLimitModel.create({
      key,
      count: 1,
      firstAttempt: now,
    });
  }

  return { allowed: true, error: null };
}

export async function resetRateLimit(key: string): Promise<void> {
  await RateLimitModel.deleteOne({ key });
}

// ============================================================================
// Audit Logging
// ============================================================================

export async function logAudit(
  userId: string,
  action: AuditAction,
  request: NextRequest,
  options: {
    resourceType?: "password" | "category" | "user" | "session";
    resourceId?: string;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  try {
    await connectDB();

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    await AuditLogModel.create({
      userId,
      action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      ipAddress,
      userAgent,
      metadata: options.metadata || {},
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error("Failed to create audit log:", error);
  }
}

// ============================================================================
// IP Address Extraction
// ============================================================================

export function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "unknown";
}

// ============================================================================
// Request Context
// ============================================================================

export function getDeviceInfo(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent") || "unknown",
    ip: getClientIp(request),
  };
}

// ============================================================================
// CORS Headers
// ============================================================================

export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
