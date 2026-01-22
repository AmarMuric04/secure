"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Key,
  Fingerprint,
  Cloud,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Shield,
    title: "Zero-Knowledge Encryption",
    description:
      "Your passwords are encrypted client-side. We never see your master password.",
  },
  {
    icon: Lock,
    title: "AES-256-GCM",
    description:
      "Military-grade encryption protects your data with the highest standards.",
  },
  {
    icon: Key,
    title: "PBKDF2 Key Derivation",
    description:
      "600,000 iterations make brute-force attacks computationally infeasible.",
  },
  {
    icon: Fingerprint,
    title: "Two-Factor Authentication",
    description:
      "Add an extra layer of security with TOTP-based authentication.",
  },
  {
    icon: Cloud,
    title: "Secure Cloud Sync",
    description:
      "Access your passwords from anywhere with encrypted cloud sync.",
  },
  {
    icon: Zap,
    title: "Password Generator",
    description:
      "Create strong, unique passwords with our cryptographic generator.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up with your email and create a strong master password that only you know.",
  },
  {
    number: "02",
    title: "Add Your Passwords",
    description:
      "Securely store all your passwords, notes, and sensitive information in your vault.",
  },
  {
    number: "03",
    title: "Access Anywhere",
    description:
      "Your encrypted data syncs seamlessly. Only you can decrypt it with your master password.",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                SecureVault
              </span>
            </Link>

            <nav className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
              ) : isAuthenticated ? (
                <Link href="/vault">
                  <Button>
                    Open Vault
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Passwords,{" "}
              <span className="text-primary">Truly Secure</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              SecureVault uses zero-knowledge encryption to protect your
              passwords. Your data is encrypted before it leaves your device —
              we never see your master password.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoading ? (
                <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
              ) : isAuthenticated ? (
                <Link href="/vault">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Go to Your Vault
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="h-12 px-8 text-base">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-12 px-8 text-base"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: Lock, text: "End-to-End Encrypted" },
              { icon: Shield, text: "Zero-Knowledge" },
              { icon: Key, text: "Open Security Model" },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Security Without Compromise
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built with the most advanced encryption technologies available.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              Get started in three simple steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-primary p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Start Protecting Your Passwords
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of users who trust SecureVault with their digital
              security.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/vault">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 text-base"
                  >
                    Open Your Vault
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-12 px-8 text-base"
                    >
                      Create Free Account
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-primary-foreground/80">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">No credit card required</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">SecureVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SecureVault. Your passwords, truly
              secure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
