"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Star,
  Pencil,
  Trash2,
  Clock,
  Globe,
  User,
  Lock,
  FileText,
  Check,
} from "lucide-react";
import {
  Button,
  Spinner,
  ConfirmDialog,
  DashboardWrapper,
} from "@/components/ui";
import { usePasswordsQuery } from "@/hooks";
import { formatRelativeTime, getFaviconUrl } from "@/lib/utils";

export default function PasswordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    passwords,
    isPending,
    deletePassword,
    isDeleting: deleteLoading,
  } = usePasswordsQuery();

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const password = passwords.find((p) => p._id === id) ?? null;

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleFavorite = async () => {
    if (!password) return;
    setIsTogglingFavorite(true);
    try {
      await fetch(`/api/vault/passwords/${password._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !password.favorite }),
      });
      // Invalidate to refresh data
      window.location.reload();
    } catch {
      // Handle error silently
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleDelete = async () => {
    if (!password) return;
    try {
      await deletePassword(password._id);
      router.push("/vault");
    } catch {
      // Handle error
    }
  };

  if (isPending) {
    return (
      <DashboardWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading password...</p>
        </div>
      </DashboardWrapper>
    );
  }

  if (!password) {
    return (
      <DashboardWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Password not found
            </h2>
            <p className="text-muted-foreground mt-1">
              This password may have been deleted
            </p>
          </div>
          <Link href="/vault">
            <Button variant="secondary">Back to Vault</Button>
          </Link>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/vault">
              <Button variant="ghost" className="p-2 rounded-2xl mt-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-start gap-4">
              {password.url ? (
                <div className="relative">
                  <Image
                    src={getFaviconUrl(password.url)}
                    alt=""
                    width={56}
                    height={56}
                    className="rounded-2xl bg-muted p-2 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/globe.svg";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  {password.title}
                </h1>
                {password.url && (
                  <a
                    href={password.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {new URL(password.url).hostname}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className="p-3 rounded-2xl"
            >
              <Star
                className={`h-5 w-5 ${
                  password.favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
            <Link href={`/vault/${password._id}/edit`}>
              <Button variant="secondary" className="gap-2 rounded-2xl">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2 rounded-2xl"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Details Card */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Username */}
          {password.username && (
            <div className="flex items-center justify-between border-b border-border p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-0.5">
                    Username
                  </p>
                  <p className="text-foreground font-medium">
                    {password.username}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleCopy(password.username!, "username")}
                className="p-3 rounded-2xl"
              >
                {copiedField === "username" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          )}

          {/* Password */}
          <div className="flex items-center justify-between border-b border-border p-6 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium mb-0.5">
                  Password
                </p>
                <p className="font-mono text-foreground font-medium truncate">
                  {showPassword ? password.password : "••••••••••••"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="p-3 rounded-2xl"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleCopy(password.password, "password")}
                className="p-3 rounded-2xl"
              >
                {copiedField === "password" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Website */}
          {password.url && (
            <div className="flex items-center justify-between border-b border-border p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground font-medium mb-0.5">
                    Website
                  </p>
                  <a
                    href={password.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium truncate block"
                  >
                    {password.url}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => handleCopy(password.url!, "website")}
                  className="p-3 rounded-2xl"
                >
                  {copiedField === "website" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="p-3 rounded-2xl">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {password.notes && (
            <div className="border-b border-border p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shrink-0 mt-0.5">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium mb-1.5">
                    Notes
                  </p>
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {password.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category */}
          {password.categoryId && (
            <div className="border-b border-border p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Category
                  </p>
                  <span className="inline-block rounded-2xl bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
                    {password.categoryId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="p-6 bg-muted/20">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div className="flex gap-4">
                <span className="font-medium">
                  Created {formatRelativeTime(password.createdAt)}
                </span>
                <span>•</span>
                <span className="font-medium">
                  Updated {formatRelativeTime(password.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Password"
        message={`Are you sure you want to delete "${password.title}"? It will be moved to trash.`}
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </DashboardWrapper>
  );
}
