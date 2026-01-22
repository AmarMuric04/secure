"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, Input, PasswordInput, Checkbox } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useAuthFlow } from "@/hooks";
import { calculatePasswordStrength } from "@/lib/crypto/client";
import { Mail, Lock, User, AlertCircle, Check, ArrowLeft } from "lucide-react";

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

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const strength = calculatePasswordStrength(password);

  const passwordRequirements = [
    { label: "At least 12 characters", met: password.length >= 12 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    {
      label: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

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

  const handleStartRegistration = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !password) {
        addToast({
          type: "error",
          title: "Missing fields",
          message: "Please fill in all required fields",
        });
        return;
      }

      if (password !== confirmPassword) {
        addToast({
          type: "error",
          title: "Passwords don't match",
          message: "Please make sure your passwords match",
        });
        return;
      }

      if (strength.score < 2) {
        addToast({
          type: "warning",
          title: "Weak password",
          message: "Please choose a stronger master password",
        });
        return;
      }

      if (!acceptedTerms) {
        addToast({
          type: "error",
          title: "Terms required",
          message: "Please accept the terms and conditions",
        });
        return;
      }

      const result = await startRegistration(
        email,
        password,
        name || undefined,
      );

      if (result.success) {
        addToast({
          type: "success",
          title: "Verification email sent!",
          message: "Please check your inbox for the verification code",
        });
        setResendCountdown(60); // 60 second cooldown before resend
      }
    },
    [
      email,
      password,
      confirmPassword,
      name,
      acceptedTerms,
      strength.score,
      startRegistration,
      addToast,
    ],
  );

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

    const result = await startRegistration(email, password, name || undefined);

    if (result.success) {
      addToast({
        type: "success",
        title: "Code resent!",
        message: "Please check your inbox for the new verification code",
      });
      setResendCountdown(60);
      setVerificationCode("");
    }
  }, [email, password, name, resendCountdown, startRegistration, addToast]);

  const handleBackToForm = useCallback(() => {
    clearPendingVerification();
    setVerificationCode("");
  }, [clearPendingVerification]);

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 sm:p-10">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Create your vault
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
        Set up your secure password manager
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Sign Up */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium rounded-xl mb-8 gap-3"
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </Button>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 font-medium">
            or create with email
          </span>
        </div>
      </div>

      <form onSubmit={handleStartRegistration} className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-4 top-10 h-5 w-5 text-gray-400" />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 h-12 rounded-xl text-base"
          />
        </div>

        <div className="relative">
          <User className="absolute left-4 top-10 h-5 w-5 text-gray-400" />
          <Input
            label="Display Name (optional)"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-12 h-12 rounded-xl text-base"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-10 h-5 w-5 text-gray-400 z-10" />
          <PasswordInput
            label="Master Password"
            placeholder="Create a strong master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-12 h-12 rounded-xl text-base"
            showStrength
            strength={strength.score as 0 | 1 | 2 | 3 | 4}
          />
        </div>

        {/* Password requirements */}
        {password && (
          <div className="space-y-1">
            {passwordRequirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check
                  className={`h-4 w-4 ${
                    req.met
                      ? "text-green-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
                <span
                  className={
                    req.met
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400"
                  }
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Lock className="absolute left-4 top-10 h-5 w-5 text-gray-400 z-10" />
          <PasswordInput
            label="Confirm Master Password"
            placeholder="Repeat your master password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-12 h-12 rounded-xl text-base"
            error={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> Your master password cannot be
            recovered. If you forget it, you will lose access to your vault.
            Consider writing it down and storing it securely.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            className="mt-1"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
            I understand that SecureVault uses zero-knowledge encryption and
            cannot recover my master password.
          </span>
        </label>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-xl"
          isLoading={isLoading}
        >
          Continue
        </Button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
        </span>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
