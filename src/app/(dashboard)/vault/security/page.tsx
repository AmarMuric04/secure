"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  User,
  CheckCircle,
  Plus,
} from "lucide-react";
import { usePasswordsQuery } from "@/hooks";
import { DecryptedPasswordEntry } from "@/stores";
import {
  Button,
  DashboardWrapper,
  Skeleton,
  MetricCard,
  LongCard,
  EmptyState,
} from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function SecurityPage() {
  const { passwords, isPending } = usePasswordsQuery({});

  // Calculate security metrics
  const securityMetrics = useMemo(() => {
    if (!passwords || passwords.length === 0) {
      return {
        weak: [],
        compromised: [],
        reused: [],
      };
    }

    const weak: DecryptedPasswordEntry[] = [];
    const compromised: DecryptedPasswordEntry[] = [];
    const reused: DecryptedPasswordEntry[] = [];

    passwords.forEach((password) => {
      // Weak passwords (strength 0 or 1 on scale of 0-4)
      if (
        password.passwordStrength !== undefined &&
        password.passwordStrength <= 1
      ) {
        weak.push(password);
      }

      // Compromised passwords
      if (password.isCompromised) {
        compromised.push(password);
      }

      // Reused passwords
      if (password.isReused) {
        reused.push(password);
      }
    });

    return {
      weak,
      compromised,
      reused,
    };
  }, [passwords]);

  const totalIssues =
    securityMetrics.weak.length +
    securityMetrics.compromised.length +
    securityMetrics.reused.length;

  const allIssues = [
    ...securityMetrics.weak,
    ...securityMetrics.compromised,
    ...securityMetrics.reused,
  ];

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and fix security issues with your passwords
          </p>
        </div>

        {/* Loading State */}
        {isPending ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </>
        ) : !passwords || passwords.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground" />}
            title="No Security Data Yet"
            description="Add some passwords to monitor their security status"
            action={
              <Button asChild className="rounded-2xl">
                <Link href="/vault/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Password
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Weak Passwords"
                value={securityMetrics.weak.length}
                description="Low strength passwords"
              />

              <MetricCard
                icon={<ShieldAlert className="h-5 w-5" />}
                title="Compromised"
                value={securityMetrics.compromised.length}
                description="Found in data breaches"
              />

              <MetricCard
                icon={<RefreshCw className="h-5 w-5" />}
                title="Reused"
                value={securityMetrics.reused.length}
                description="Used multiple times"
              />
            </div>

            {/* Issues List */}
            {totalIssues === 0 ? (
              <EmptyState
                icon={<CheckCircle className="h-8 w-8 text-muted-foreground" />}
                title="All Clear!"
                description="No security issues detected with your passwords. Keep up the good work!"
              />
            ) : (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Security Issues ({totalIssues})
                </h2>
                {allIssues.map((password) => (
                  <LongCard key={password._id} hoverable>
                    {/* Icon/Avatar */}
                    <Link href={`/vault/${password._id}`}>
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {password.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/vault/${password._id}`}
                          className="font-semibold text-foreground hover:text-primary truncate transition-colors"
                        >
                          {password.title}
                        </Link>
                        {password.isCompromised && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-xl bg-red-500/10 text-red-500">
                            <ShieldAlert className="h-3 w-3" />
                            Compromised
                          </span>
                        )}
                        {!password.isCompromised &&
                          password.passwordStrength !== undefined &&
                          password.passwordStrength <= 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-xl bg-yellow-500/10 text-yellow-500">
                              <AlertTriangle className="h-3 w-3" />
                              Weak
                            </span>
                          )}
                        {!password.isCompromised &&
                          password.passwordStrength !== undefined &&
                          password.passwordStrength > 1 &&
                          password.isReused && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-xl bg-yellow-500/10 text-yellow-500">
                              Reused
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate max-w-48">
                            {password.username || "No username"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* URL */}
                    {password.url && (
                      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate max-w-48">
                          {new URL(password.url).hostname}
                        </span>
                      </div>
                    )}

                    {/* Updated time */}
                    <div className="hidden lg:flex items-center text-sm text-muted-foreground min-w-24">
                      <span>{formatRelativeTime(password.updatedAt)}</span>
                    </div>

                    {/* Password strength indicator */}
                    {password.passwordStrength !== undefined && (
                      <div className="hidden sm:flex flex-col items-end gap-1.5 min-w-24">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-2 w-3 rounded-full transition-all",
                                i <= password.passwordStrength
                                  ? password.passwordStrength <= 1
                                    ? "bg-red-500"
                                    : password.passwordStrength === 2
                                      ? "bg-yellow-500"
                                      : password.passwordStrength === 3
                                        ? "bg-lime-500"
                                        : "bg-green-500"
                                  : "bg-muted",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {password.passwordStrength <= 1
                            ? "Weak"
                            : password.passwordStrength === 2
                              ? "Fair"
                              : password.passwordStrength === 3
                                ? "Strong"
                                : "Very Strong"}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl shrink-0"
                      asChild
                    >
                      <Link href={`/vault/${password._id}`}>View</Link>
                    </Button>
                  </LongCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}
