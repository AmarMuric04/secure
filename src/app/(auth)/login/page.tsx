"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Button,
  Input,
  PasswordInput,
  Spinner,
  Checkbox,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { deriveKeys } from "@/lib/crypto/client";
import { useVaultStore } from "@/stores";
import { Mail, Lock, AlertCircle } from "lucide-react";

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { setEncryptionKey } = useVaultStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  // Check for MFA redirect
  const mfaRequired = searchParams.get("mfa") === "required";

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      addToast({
        type: "error",
        title: "Missing fields",
        message: "Please enter your email and password",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Fetch the user's salt from the server
      const saltResponse = await fetch("/api/auth/salt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!saltResponse.ok) {
        setError("Failed to connect to server");
        addToast({
          type: "error",
          title: "Connection error",
          message: "Failed to connect to server",
        });
        setIsLoading(false);
        return;
      }

      const { data: saltData } = await saltResponse.json();
      const salt = saltData.salt;

      console.log("[Login] Retrieved salt:", salt.substring(0, 16) + "...");

      // Step 2: Derive both auth hash AND encryption key using the correct salt
      const { authHash, encryptionKey } = await deriveKeys(password, salt);

      console.log("[Login] Derived keys using salt");

      // Step 3: Authenticate with NextAuth
      const result = await signIn("credentials", {
        email,
        authHash,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        addToast({
          type: "error",
          title: "Login failed",
          message: "Invalid email or password",
        });
      } else if (result?.url?.includes("mfa=required")) {
        // MFA is required
        setShowMfa(true);
      } else {
        // Login successful - set the encryption key so vault can decrypt passwords
        setEncryptionKey(encryptionKey);

        // Store key in sessionStorage so it survives page refresh
        const exportedKey = await crypto.subtle.exportKey("jwk", encryptionKey);
        sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));

        addToast({
          type: "success",
          title: "Welcome back!",
          message: "Successfully logged in",
        });
        router.push("/vault");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/vault" });
    } catch {
      setError("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    // MFA verification logic - to be implemented
    addToast({
      type: "info",
      title: "MFA Verification",
      message: "MFA verification coming soon",
    });
  };

  if (showMfa || mfaRequired) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={handleMfaVerify} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            placeholder="000000"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Verify
          </Button>

          <button
            type="button"
            onClick={() => {
              setShowMfa(false);
              router.replace("/login");
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 sm:p-10">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome back
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
        Sign in to access your vault
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium rounded-xl mb-8 gap-3"
        onClick={handleGoogleLogin}
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
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleCredentialsLogin} className="space-y-5">
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
          <Lock className="absolute left-4 top-10 h-5 w-5 text-gray-400 z-10" />
          <PasswordInput
            label="Master Password"
            placeholder="Enter your master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-12 h-12 rounded-xl text-base"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox className="border-input" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-xl"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
        </span>
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
