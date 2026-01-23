"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, useToast } from "@repo/ui";
import { AuthLayout, RegisterForm } from "@repo/auth";
import { useAuthFlow } from "@/hooks";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Verification code input component
function VerificationCodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    const newCode = newValue.join("").slice(0, 6);
    onChange(newCode);

    // Move to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pastedData);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { addToast } = useToast();
  const {
    startRegistration,
    completeRegistration,
    pendingVerification,
    clearPendingVerification,
    isLoading,
    error,
  } = useAuthFlow();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/vault" });
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to sign up with Google",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleVerifyCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (verificationCode.length !== 6) {
        addToast({
          type: "error",
          title: "Invalid code",
          message: "Please enter the 6-digit verification code",
        });
        return;
      }

      const result = await completeRegistration(verificationCode);

      if (result) {
        // Navigate immediately - don't do anything that triggers re-render
        // The success will be evident from being on /vault
        window.location.href = "/vault";
        // Keep function "hanging" to prevent any state updates from re-rendering
        await new Promise(() => {});
      }
    },
    [verificationCode, completeRegistration, addToast],
  );

  const handleResendCode = useCallback(async () => {
    if (resendCountdown > 0) return;

    // Since we now capture email/password via the reusable form, we cannot resend easily; user will need to re-enter
    addToast({
      type: "info",
      title: "Resend unavailable",
      message: "Please restart registration if code expired",
    });
  }, [resendCountdown, addToast]);

  const handleBackToForm = useCallback(() => {
    clearPendingVerification();
    setVerificationCode("");
  }, [clearPendingVerification]);

  const adapter = {
    signUp: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const result = await startRegistration(email, password, undefined);
      if (!result.success) throw new Error("Registration failed");
      addToast({
        type: "success",
        title: "Verification email sent!",
        message: "Please check your inbox for the verification code",
      });
      setResendCountdown(60);
      return result;
    },
  };

  // Show verification step if we have pending verification
  if (pendingVerification) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 sm:p-10">
        <button
          onClick={handleBackToForm}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to registration</span>
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Check your email
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            We sent a verification code to
          </p>
          <p className="font-semibold text-gray-900 dark:text-white text-lg mt-1">
            {pendingVerification.email}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
              Enter verification code
            </label>
            <VerificationCodeInput
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            isLoading={isLoading}
            disabled={verificationCode.length !== 6}
          >
            Verify & Create Account
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Didn&apos;t receive the code?{" "}
            {resendCountdown > 0 ? (
              <span className="text-gray-400 font-medium">
                Resend in {resendCountdown}s
              </span>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                disabled={isLoading}
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Create your vault</h2>
          <p className="text-muted-foreground">
            Set up your secure password manager
          </p>
        </div>

        {/* Google Sign Up */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-base font-medium rounded-xl gap-3"
          onClick={handleGoogleSignUp}
          isLoading={isGoogleLoading}
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 font-medium">
              or create with email
            </span>
          </div>
        </div>

        <RegisterForm adapter={adapter} />

        <div className="text-center">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link href="/login" className="text-primary font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
