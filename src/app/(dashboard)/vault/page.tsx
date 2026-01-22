"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";
import { usePasswordsQuery } from "@/hooks";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Button,
  Input,
  DashboardWrapper,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DecryptedPasswordEntry } from "@/stores";
import {
  Key,
  Star,
  Copy,
  ExternalLink,
  MoreVertical,
  AlertTriangle,
  Plus,
  Search,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  RefreshCw,
  Check,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type ViewMode = "grid" | "list";
type SortField = "title" | "updatedAt" | "createdAt" | "passwordStrength";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export default function VaultPage() {
  const { addToast } = useToast();
  const {
    passwords,
    favorites,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    deletePassword,
    toggleFavorite,
  } = usePasswordsQuery();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    "vault-view-mode",
    "list",
  );
  const [quickAccessOpen, setQuickAccessOpen] = useLocalStorage<boolean>(
    "vault-quick-access-open",
    true,
  );
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort passwords
  const filteredPasswords = useMemo(() => {
    let result = [...passwords];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.username?.toLowerCase().includes(query) ||
          p.url?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    // Weak passwords filter
    if (showWeakOnly) {
      result = result.filter((p) => p.passwordStrength <= 1);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((p) => p.favorite);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "passwordStrength":
          comparison = a.passwordStrength - b.passwordStrength;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    passwords,
    searchQuery,
    sortField,
    sortOrder,
    showWeakOnly,
    showFavoritesOnly,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredPasswords.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedPasswords = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPasswords.slice(startIndex, endIndex);
  }, [filteredPasswords, safePage]);

  // Stats
  const stats = useMemo(() => {
    const weak = passwords.filter((p) => p.passwordStrength <= 1).length;
    const compromised = passwords.filter((p) => p.isCompromised).length;
    const reused = passwords.filter((p) => p.isReused).length;
    return { weak, compromised, reused, total: passwords.length };
  }, [passwords]);

  const handleCopyPassword = async (password: string) => {
    await navigator.clipboard.writeText(password);
    addToast({
      type: "success",
      title: "Copied!",
      message: "Password copied to clipboard",
      duration: 2000,
    });

    // Auto-clear clipboard after 30 seconds
    setTimeout(() => {
      navigator.clipboard.writeText("");
    }, 30000);
  };

  const handleCopyUsername = async (username: string) => {
    await navigator.clipboard.writeText(username);
    addToast({
      type: "success",
      title: "Copied!",
      message: "Username copied to clipboard",
      duration: 2000,
    });
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deletePassword(id);
      addToast({
        type: "success",
        title: "Moved to trash",
        message: `"${title}" has been moved to trash`,
      });
    } catch {
      addToast({
        type: "error",
        title: "Failed to delete",
        message: "Could not delete the password. Please try again.",
      });
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <DashboardWrapper>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header - Always visible */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              All Passwords
            </h1>
            <p className="text-muted-foreground text-lg">
              {isPending ? (
                <span className="inline-block h-6 w-48 bg-accent animate-pulse rounded-md" />
              ) : (
                `${stats.total} password${stats.total !== 1 ? "s" : ""} stored securely`
              )}
            </p>
          </div>
          <Link href="/vault/new">
            <Button className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isPending && (
          <>
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm"
                >
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              ))}
            </div>

            {/* Search Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Skeleton className="flex-1 h-11 rounded-2xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <Skeleton className="h-11 w-24 rounded-2xl" />
                <Skeleton className="h-11 w-32 rounded-2xl" />
                <Skeleton className="h-11 w-11 rounded-2xl" />
              </div>
            </div>

            {/* Password Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-card rounded-3xl border shadow-sm space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} className="h-2 flex-1 rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Failed to load vault
              </h2>
              <p className="text-muted-foreground mt-1">
                {error?.message ||
                  "An error occurred while loading your passwords"}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isPending && !isError && passwords.length === 0 && (
          <EmptyState
            icon={<Key className="h-8 w-8 text-muted-foreground" />}
            title="No passwords yet"
            description="Add your first password to get started with SecureVault"
            action={
              <Button asChild className="rounded-2xl">
                <Link href="/vault/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Password
                </Link>
              </Button>
            }
          />
        )}

        {/* Data loaded successfully */}
        {!isPending && !isError && passwords.length > 0 && (
          <>
            {/* Stats Cards */}
            {(stats.weak > 0 || stats.compromised > 0 || stats.reused > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.weak > 0 && (
                  <button
                    onClick={() => setShowWeakOnly(!showWeakOnly)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-3xl border transition-all text-left shadow-sm",
                      showWeakOnly
                        ? "bg-orange-500/10 border-orange-500 shadow-orange-500/20"
                        : "bg-card hover:bg-accent hover:shadow-md",
                    )}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium mb-1">
                        Weak Passwords
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.weak}
                      </p>
                    </div>
                    {showWeakOnly && (
                      <Check className="h-5 w-5 text-orange-500 shrink-0" />
                    )}
                  </button>
                )}
                {stats.compromised > 0 && (
                  <div className="flex items-center gap-4 p-5 rounded-3xl border bg-red-500/10 border-red-500/50 shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">
                        Compromised
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.compromised}
                      </p>
                    </div>
                  </div>
                )}
                {stats.reused > 0 && (
                  <div className="flex items-center gap-4 p-5 rounded-3xl border bg-yellow-500/10 border-yellow-500/50 shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                      <Copy className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">
                        Reused
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.reused}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search and Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 rounded-2xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Favorites filter */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="rounded-2xl h-11 px-4"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          showFavoritesOnly && "fill-current",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {showFavoritesOnly ? "Show all" : "Show favorites only"}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl h-11 px-4"
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-md">
                    <DropdownMenuItem onClick={() => toggleSort("title")}>
                      <span className="flex-1">Name</span>
                      {sortField === "title" && (
                        <Check className="h-4 w-4 ml-2" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort("updatedAt")}>
                      <span className="flex-1">Last Updated</span>
                      {sortField === "updatedAt" && (
                        <Check className="h-4 w-4 ml-2" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort("createdAt")}>
                      <span className="flex-1">Date Created</span>
                      {sortField === "createdAt" && (
                        <Check className="h-4 w-4 ml-2" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleSort("passwordStrength")}
                    >
                      <span className="flex-1">Password Strength</span>
                      {sortField === "passwordStrength" && (
                        <Check className="h-4 w-4 ml-2" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View mode toggle */}
                <div className="flex items-center rounded-2xl border bg-card p-1 shadow-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          viewMode === "list"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>List view</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          viewMode === "grid"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Grid view</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Refresh */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="rounded-2xl h-11 px-4"
                    >
                      <RefreshCw
                        className={cn("h-4 w-4", isFetching && "animate-spin")}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Quick Access - Favorites */}
            {favorites.length > 0 && !showFavoritesOnly && !searchQuery && (
              <Collapsible
                open={quickAccessOpen}
                onOpenChange={setQuickAccessOpen}
              >
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-3 w-full group">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <h2 className="text-lg font-semibold text-foreground">
                          Quick Access
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          ({favorites.length > 4 ? "4+" : favorites.length})
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform duration-200",
                          quickAccessOpen && "rotate-180",
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                      {favorites.slice(0, 4).map((entry) => (
                        <PasswordCard
                          key={entry._id}
                          entry={entry}
                          compact
                          onCopyPassword={handleCopyPassword}
                          onCopyUsername={handleCopyUsername}
                          onDelete={handleDelete}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* All Passwords Section Title */}
            {!searchQuery && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    {showFavoritesOnly
                      ? "Favorite Passwords"
                      : showWeakOnly
                        ? "Weak Passwords"
                        : "All Passwords"}
                  </h2>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground font-medium">
                  {filteredPasswords.length}{" "}
                  {filteredPasswords.length === 1 ? "password" : "passwords"}
                </span>
              </div>
            )}

            {/* Results info */}
            {searchQuery && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Search Results
                  </h2>
                </div>
                <div className="flex-1 h-px bg-border" />
                <p className="text-sm text-muted-foreground font-medium">
                  {filteredPasswords.length} result
                  {filteredPasswords.length !== 1 ? "s" : ""} for &quot;
                  {searchQuery}&quot;
                </p>
              </div>
            )}

            {/* Password List/Grid */}
            {filteredPasswords.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8 text-muted-foreground" />}
                title="No matches found"
                description="Try adjusting your search or filters"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setShowWeakOnly(false);
                      setShowFavoritesOnly(false);
                      setCurrentPage(1);
                    }}
                    className="rounded-2xl"
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedPasswords.map((entry) => (
                      <PasswordCard
                        key={entry._id}
                        entry={entry}
                        compact
                        onCopyPassword={handleCopyPassword}
                        onCopyUsername={handleCopyUsername}
                        onDelete={handleDelete}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedPasswords.map((entry) => (
                      <PasswordCard
                        key={entry._id}
                        entry={entry}
                        onCopyPassword={handleCopyPassword}
                        onCopyUsername={handleCopyUsername}
                        onDelete={handleDelete}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {(safePage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-foreground">
                        {Math.min(
                          safePage * ITEMS_PER_PAGE,
                          filteredPasswords.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-foreground">
                        {filteredPasswords.length}
                      </span>{" "}
                      passwords
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(safePage - 1)}
                        disabled={safePage <= 1}
                        className="rounded-2xl"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (safePage <= 3) {
                              pageNum = i + 1;
                            } else if (safePage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = safePage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  safePage === pageNum ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-10 h-10 p-0 rounded-2xl"
                              >
                                {pageNum}
                              </Button>
                            );
                          },
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(safePage + 1)}
                        disabled={safePage >= totalPages}
                        className="rounded-2xl"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}

// ============================================================================
// Password Card Component
// ============================================================================

interface PasswordCardProps {
  entry: DecryptedPasswordEntry;
  compact?: boolean;
  onCopyPassword: (password: string) => void;
  onCopyUsername: (username: string) => void;
  onDelete: (id: string, title: string) => void;
  onToggleFavorite: (id: string) => void;
}

function PasswordCard({
  entry,
  compact,
  onCopyPassword,
  onCopyUsername,
  onDelete,
  onToggleFavorite,
}: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  const handleCopy = async (
    text: string,
    field: string,
    handler: (text: string) => void,
  ) => {
    handler(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderAvatar = () => {
    // Get first letter from username, title, or use "?"
    const letter = (entry.username?.[0] || entry.title[0] || "?").toUpperCase();

    return (
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
        <span className="text-lg font-semibold text-primary">{letter}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="group relative p-5 bg-card rounded-3xl border hover:border-primary transition-all shadow-sm hover:shadow-md">
        <Link href={`/vault/${entry._id}`} className="block">
          <div className="flex items-start gap-4 mb-4">
            {renderAvatar()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground truncate">
                  {entry.title}
                </p>
                {entry.favorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {entry.username || "No username"}
              </p>
            </div>
          </div>

          {/* Strength indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    i <= entry.passwordStrength
                      ? strengthColors[entry.passwordStrength]
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {strengthLabels[entry.passwordStrength]}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {entry.isCompromised && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-xl bg-red-500/10 text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Compromised
              </span>
            )}
            {entry.isReused && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-xl bg-yellow-500/10 text-yellow-500">
                Reused
              </span>
            )}
          </div>
        </Link>

        {/* Quick actions overlay */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-2xl bg-background/90 backdrop-blur text-muted-foreground hover:text-foreground transition-colors shadow-md">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg">
              <DropdownMenuItem onClick={() => onToggleFavorite(entry._id)}>
                <Star
                  className={cn(
                    "h-4 w-4 mr-2",
                    entry.favorite && "fill-yellow-500 text-yellow-500",
                  )}
                />
                {entry.favorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleCopy(entry.password, "password", onCopyPassword)
                }
              >
                <Key className="h-4 w-4 mr-2" />
                Copy password
              </DropdownMenuItem>
              {entry.username && (
                <DropdownMenuItem
                  onClick={() =>
                    handleCopy(entry.username!, "username", onCopyUsername)
                  }
                >
                  <User className="h-4 w-4 mr-2" />
                  Copy username
                </DropdownMenuItem>
              )}
              {entry.url && (
                <DropdownMenuItem asChild>
                  <a href={entry.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open website
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/vault/${entry._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vault/${entry._id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(entry._id, entry.title)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Move to trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-5 bg-card rounded-3xl border hover:bg-accent/30 transition-all group shadow-sm">
      {/* Icon */}
      <Link href={`/vault/${entry._id}`}>{renderAvatar()}</Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/vault/${entry._id}`}
            className="font-semibold text-foreground hover:text-primary truncate transition-colors"
          >
            {entry.title}
          </Link>
          {entry.favorite && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
          {entry.isCompromised && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-3 w-3" />
              Compromised
            </span>
          )}
          {entry.isReused && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-xl bg-yellow-500/10 text-yellow-500">
              Reused
            </span>
          )}
        </div>
        {/* Username with inline copy icon */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="truncate max-w-48">
              {entry.username || "No username"}
            </span>
          </div>
          {entry.username && (
            <button
              onClick={() =>
                handleCopy(entry.username!, "username", onCopyUsername)
              }
              className={cn(
                "p-1 rounded-lg transition-all shrink-0",
                copiedField === "username"
                  ? "text-green-500 bg-green-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {copiedField === "username" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Password preview with inline copy */}
      <div className="hidden lg:flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl">
          <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <code className="text-sm text-muted-foreground font-mono truncate max-w-32">
            {showPassword ? entry.password : "••••••••••••"}
          </code>
        </div>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0"
        >
          {showPassword ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => handleCopy(entry.password, "password", onCopyPassword)}
          className={cn(
            "p-1.5 rounded-lg transition-all shrink-0",
            copiedField === "password"
              ? "text-green-500 bg-green-500/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {copiedField === "password" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      <div className="hidden sm:flex flex-col items-end gap-1.5 min-w-24">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-3 rounded-full transition-all",
                i <= entry.passwordStrength
                  ? strengthColors[entry.passwordStrength]
                  : "bg-muted",
              )}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {strengthLabels[entry.passwordStrength]}
        </span>
      </div>

      {/* Last updated */}
      <span className="hidden md:block text-sm text-muted-foreground whitespace-nowrap min-w-24 text-right">
        {formatRelativeTime(entry.updatedAt)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg">
            <DropdownMenuItem onClick={() => onToggleFavorite(entry._id)}>
              <Star
                className={cn(
                  "h-4 w-4 mr-2",
                  entry.favorite && "fill-yellow-500 text-yellow-500",
                )}
              />
              {entry.favorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                handleCopy(entry.password, "password", onCopyPassword)
              }
            >
              <Key className="h-4 w-4 mr-2" />
              Copy password
            </DropdownMenuItem>
            {entry.username && (
              <DropdownMenuItem
                onClick={() =>
                  handleCopy(entry.username!, "username", onCopyUsername)
                }
              >
                <User className="h-4 w-4 mr-2" />
                Copy username
              </DropdownMenuItem>
            )}
            {entry.url && (
              <DropdownMenuItem asChild>
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open website
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/vault/${entry._id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/vault/${entry._id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(entry._id, entry.title)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
