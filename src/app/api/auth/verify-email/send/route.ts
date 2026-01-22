/**
 * Send Email Verification API
 * POST /api/auth/verify-email/send
 *
 * Sends a verification code to the user's email before registration
 */

import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/db/connection";
import { UserModel, EmailVerificationTokenModel } from "@/lib/db/models";
import { sendVerificationEmail } from "@/lib/email";
import {
  successResponse,
  errorResponse,
  parseBody,
  checkRateLimit,
  getClientIp,
} from "@/lib/api/utils";
import { z } from "zod";

const sendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  authHash: z.string().min(1, "Auth hash is required"),
  salt: z.string().min(1, "Salt is required"),
  encryptedVaultKey: z.string().min(1, "Encrypted vault key is required"),
});

type SendVerificationRequest = z.infer<typeof sendVerificationSchema>;

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitKey = `verify-email:${ip}`;
    const { allowed, error: rateLimitError } = await checkRateLimit(
      rateLimitKey,
      "register", // Use register rate limit (5 per hour)
    );

    if (!allowed) {
      return rateLimitError!;
    }

    // Parse and validate request body
    const { data, error: parseError } =
      await parseBody<SendVerificationRequest>(request, sendVerificationSchema);

    if (parseError) {
      return parseError;
    }

    await connectDB();

    const email = data!.email.toLowerCase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return errorResponse(
        "EMAIL_EXISTS",
        "An account with this email already exists",
        409,
      );
    }

    // Delete any existing verification tokens for this email
    await EmailVerificationTokenModel.deleteMany({ email });

    // Generate verification token and code
    const token = uuidv4();
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification token with registration data
    await EmailVerificationTokenModel.create({
      email,
      token,
      code,
      expiresAt,
      verified: false,
      registrationData: {
        name: data!.name,
        authHash: data!.authHash,
        salt: data!.salt,
        encryptedVaultKey: data!.encryptedVaultKey,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      email,
      code,
      name: data!.name,
    });

    if (!emailResult.success) {
      // Clean up token if email failed
      await EmailVerificationTokenModel.deleteOne({ token });
      return errorResponse(
        "EMAIL_FAILED",
        "Failed to send verification email. Please try again.",
        500,
      );
    }

    return successResponse(
      {
        message: "Verification email sent",
        token, // Return token so client can track the verification
      },
      200,
    );
  } catch (error) {
    console.error("Send verification error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
