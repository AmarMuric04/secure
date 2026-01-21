import Link from "next/link";
import { Shield, Lock, Key, Fingerprint, Cloud, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Zero-Knowledge Encryption",
    description:
      "Your passwords are encrypted client-side before ever leaving your device. We never see your master password.",
  },
  {
    icon: Lock,
    title: "AES-256-GCM",
    description:
      "Military-grade encryption protects your data. The same standard used by governments worldwide.",
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
      "Add an extra layer of security with TOTP-based two-factor authentication.",
  },
  {
    icon: Cloud,
    title: "Secure Cloud Sync",
    description:
      "Access your passwords from anywhere. Encrypted data syncs seamlessly across devices.",
  },
  {
    icon: Zap,
    title: "Password Generator",
    description:
      "Create strong, unique passwords for every account with our cryptographically secure generator.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">SecureVault</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your Passwords,{" "}
              <span className="text-blue-500">Truly Secure</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              SecureVault uses zero-knowledge encryption to protect your
              passwords. Your data is encrypted before it leaves your device —
              we never see your master password.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-gray-700 px-6 py-3 text-base font-medium text-gray-300 hover:border-gray-600 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Zero-Knowledge Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>Open Security Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Security Without Compromise
            </h2>
            <p className="mt-4 text-gray-400">
              Built with the most advanced encryption technologies available.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <feature.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              How Zero-Knowledge Works
            </h2>
            <p className="mt-4 text-gray-400">
              Your master password never leaves your device.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-500">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                Create Master Password
              </h3>
              <p className="mt-2 text-gray-400">
                Your master password is used to derive encryption keys locally
                on your device.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-500">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                Encrypt Everything
              </h3>
              <p className="mt-2 text-gray-400">
                All your passwords are encrypted with AES-256-GCM before being
                sent to our servers.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-500">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                Access Anywhere
              </h3>
              <p className="mt-2 text-gray-400">
                Encrypted data syncs to the cloud. Only you can decrypt it with
                your master password.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Start Protecting Your Passwords Today
          </h2>
          <p className="mt-4 text-blue-100">
            Join thousands of users who trust SecureVault with their digital
            security.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="font-semibold text-white">SecureVault</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SecureVault. Your passwords, truly
              secure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
