/**
 * Get User Salt API
 * POST /api/auth/salt
 * Returns the user's salt for key derivation (before login)
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models";
import { z } from "zod";
import { successResponse, errorResponse, parseBody } from "@/lib/api/utils";

const saltRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SaltRequest = z.infer<typeof saltRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const { data, error: parseError } = await parseBody<SaltRequest>(
      request,
      saltRequestSchema,
    );

    if (parseError) {
      return parseError;
    }

    await connectDB();

    // Find user by email
    const user = await UserModel.findOne({
      email: data.email.toLowerCase(),
      status: "active",
    }).select("authSalt authProvider");

    if (!user) {
      // Don't reveal if user exists - return a fake salt
      // This prevents user enumeration attacks
      // Use a deterministic "salt" based on email so it's consistent
      const fakeEncoder = new TextEncoder();
      const fakeData = fakeEncoder.encode(
        data.email + process.env.NEXTAUTH_SECRET,
      );
      const fakeHashBuffer = await crypto.subtle.digest("SHA-256", fakeData);
      const fakeHash = Array.from(new Uint8Array(fakeHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return successResponse({
        salt: fakeHash.slice(0, 64), // Return 64 chars like a real salt
      });
    }

    // OAuth users don't have a salt - they should use OAuth login
    if (!user.authSalt || user.authProvider !== "credentials") {
      // Return a fake salt to prevent user enumeration
      const fakeEncoder = new TextEncoder();
      const fakeData = fakeEncoder.encode(
        data.email + process.env.NEXTAUTH_SECRET,
      );
      const fakeHashBuffer = await crypto.subtle.digest("SHA-256", fakeData);
      const fakeHash = Array.from(new Uint8Array(fakeHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return successResponse({
        salt: fakeHash.slice(0, 64),
      });
    }

    return successResponse({
      salt: user.authSalt,
    });
  } catch (error) {
    console.error("Salt retrieval error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
