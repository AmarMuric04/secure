"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Input, PasswordInput, Checkbox } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useAuthFlow } from "@/hooks";
import { calculatePasswordStrength } from "@/lib/crypto/client";
import { Mail, Lock, User, AlertCircle, Check } from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { register, isLoading, error } = useAuthFlow();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleRegister = useCallback(
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

      const result = await register(email, password, name || undefined);

      if (result) {
        addToast({
          type: "success",
          title: "Account created!",
          message: "Your vault is ready to use",
        });
        router.push("/vault");
      }
    },
    [
      email,
      password,
      confirmPassword,
      name,
      acceptedTerms,
      strength.score,
      register,
      addToast,
      router,
    ],
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Create your vault
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Set up your secure password manager
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Google Sign Up */}
      <Button
        type="button"
        variant="outline"
        className="w-full mb-6 gap-3"
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">
            or create with email
          </span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
          <Input
            label="Display Name (optional)"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400 z-10" />
          <PasswordInput
            label="Master Password"
            placeholder="Create a strong master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
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
          <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400 z-10" />
          <PasswordInput
            label="Confirm Master Password"
            placeholder="Repeat your master password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            error={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
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
            className="mt-0.5"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            I understand that SecureVault uses zero-knowledge encryption and
            cannot recover my master password.
          </span>
        </label>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
        </span>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
