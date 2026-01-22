"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  User,
  Search,
  Loader2,
  Trash,
  XCircle,
} from "lucide-react";
import { usePasswordsQuery } from "@/hooks";
import {
  Button,
  DashboardWrapper,
  Checkbox,
  Skeleton,
  LongCard,
  EmptyState,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

export default function TrashPage() {
  const { addToast } = useToast();
  const {
    passwords,
    isPending,
    isError,
    error,
    restorePassword,
    deletePassword,
    isRestoring,
    isDeleting,
  } = usePasswordsQuery({ includeDeleted: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState<
    string | null
  >(null);

  // Filter only deleted passwords
  const trashedPasswords = passwords.filter((p) => p.deletedAt);

  // Apply search filter
  const filteredPasswords = trashedPasswords.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.username?.toLowerCase().includes(query) ||
      p.url?.toLowerCase().includes(query)
    );
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredPasswords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPasswords.map((p) => p._id)));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restorePassword(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      addToast({
        type: "success",
        title: "Password restored",
        message: "The password has been restored to your vault",
      });
    } catch {
      addToast({
        type: "error",
        title: "Restore failed",
        message: "Failed to restore password. Please try again.",
      });
    }
  };

  const handleRestoreSelected = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await restorePassword(id);
      } catch {
        // Continue with others
      }
    }
    setSelectedIds(new Set());
    addToast({
      type: "success",
      title: "Passwords restored",
      message: `Restored ${ids.length} password(s) to your vault`,
    });
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await deletePassword(id, true);
      setConfirmPermanentDelete(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      addToast({
        type: "success",
        title: "Password deleted",
        message: "Password permanently deleted from your vault",
      });
    } catch {
      addToast({
        type: "error",
        title: "Delete failed",
        message: "Failed to delete password. Please try again.",
      });
    }
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await deletePassword(id, true);
      } catch {
        // Continue with others
      }
    }
    setSelectedIds(new Set());
    addToast({
      type: "success",
      title: "Passwords deleted",
      message: `Permanently deleted ${ids.length} password(s)`,
    });
  };

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
    return `${Math.floor(diffDays / 30)} month(s) ago`;
  };

  // Calculate days until permanent deletion (30 days from deletion)
  const getDaysUntilDeletion = (deletedAt: Date | string | undefined) => {
    if (!deletedAt) return 30;
    const d = new Date(deletedAt);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
  };

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Trash</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {isPending ? (
              <span className="inline-block h-6 w-48 bg-accent animate-pulse rounded-md" />
            ) : (
              `${trashedPasswords.length} deleted password${trashedPasswords.length !== 1 ? "s" : ""}`
            )}
          </p>
        </div>

        {/* Loading State */}
        {isPending && (
          <>
            {/* Warning Banner Skeleton */}
            <div className="rounded-3xl p-5 flex items-start gap-4 border">
              <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>

            {/* Search and Actions Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-11 flex-1 rounded-2xl" />
              <Skeleton className="h-11 w-32 rounded-2xl" />
              <Skeleton className="h-11 w-32 rounded-2xl" />
            </div>

            {/* Password Cards Skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border p-5 flex items-center gap-4"
                >
                  <Skeleton className="h-5 w-5 rounded shrink-0" />
                  <div className="h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center border">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-2xl" />
                  <Skeleton className="h-9 w-9 rounded-2xl" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="p-4 rounded-full bg-red-500/10">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold">Failed to load trash</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {error?.message ||
                "An error occurred while loading deleted passwords"}
            </p>
          </div>
        )}

        {/* Data loaded successfully */}
        {!isPending && !isError && (
          <>
            {/* Warning Banner */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Items in trash will be permanently deleted
                </h3>
                <p className="text-sm text-muted-foreground">
                  Deleted passwords are automatically removed after 30 days. You
                  can restore them before then.
                </p>
              </div>
            </div>

            {trashedPasswords.length === 0 ? (
              <EmptyState
                icon={<Trash2 className="h-8 w-8 text-muted-foreground" />}
                title="Trash is empty"
                description="Deleted passwords will appear here. You can restore them within 30 days."
                action={
                  <Link href="/vault">
                    <Button variant="outline" className="rounded-2xl">
                      Back to Vault
                    </Button>
                  </Link>
                }
              />
            ) : (
              <>
                {/* Search & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search deleted passwords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedIds.size} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreSelected}
                        disabled={isRestoring}
                        className="rounded-2xl"
                      >
                        {isRestoring ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Restore Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className="rounded-2xl text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Trash className="w-4 h-4 mr-2" />
                        )}
                        Delete Forever
                      </Button>
                    </div>
                  )}
                </div>

                {/* Select All */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedIds.size === filteredPasswords.length &&
                      filteredPasswords.length > 0
                    }
                    onCheckedChange={selectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm text-muted-foreground cursor-pointer font-medium"
                  >
                    Select all ({filteredPasswords.length})
                  </label>
                </div>

                {/* Passwords List */}
                <div className="space-y-3">
                  {filteredPasswords.map((password) => {
                    const daysLeft = getDaysUntilDeletion(password.deletedAt);
                    const isUrgent = daysLeft <= 7;

                    return (
                      <LongCard
                        key={password._id}
                        variant={
                          selectedIds.has(password._id) ? "selected" : "default"
                        }
                        hoverable={!selectedIds.has(password._id)}
                        className="relative"
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedIds.has(password._id)}
                          onCheckedChange={() => toggleSelection(password._id)}
                        />

                        {/* Icon/Avatar */}
                        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground line-through">
                            {password.title.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-muted-foreground line-through truncate">
                              {password.title}
                            </h3>
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

                        {/* Deletion Timer */}
                        <div
                          className={`hidden lg:flex items-center gap-1 text-sm min-w-24 ${
                            isUrgent ? "text-red-500" : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>
                            {daysLeft === 0 ? "Soon" : `${daysLeft}d left`}
                          </span>
                        </div>

                        {/* Deleted At */}
                        <div className="hidden sm:flex text-sm text-muted-foreground min-w-24">
                          {formatTimeAgo(password.deletedAt)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(password._id)}
                            disabled={isRestoring}
                            className="rounded-2xl"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setConfirmPermanentDelete(password._id)
                            }
                            disabled={isDeleting}
                            className="rounded-2xl text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Confirm Permanent Delete Dialog */}
                        {confirmPermanentDelete === password._id && (
                          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-3xl flex items-center justify-center p-4 z-10">
                            <div className="text-center">
                              <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                              <h4 className="font-medium mb-1">
                                Permanently delete this password?
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                This action cannot be undone.
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setConfirmPermanentDelete(null)
                                  }
                                  className="rounded-2xl"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handlePermanentDelete(password._id)
                                  }
                                  disabled={isDeleting}
                                  className="rounded-2xl text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                  ) : null}
                                  Delete Forever
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </LongCard>
                    );
                  })}
                </div>

                {filteredPasswords.length === 0 && searchQuery && (
                  <EmptyState
                    icon={<Search className="h-8 w-8 text-muted-foreground" />}
                    title="No results found"
                    description="No deleted passwords match your search"
                    action={
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                        className="rounded-2xl"
                      >
                        Clear search
                      </Button>
                    }
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}
