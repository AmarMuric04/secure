"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";
import { usePasswordsQuery } from "@/hooks";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button, Input, Skeleton, DashboardWrapper, EmptyState } from "@/components/ui";
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
  Key,
  Star,
  Copy,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  Plus,
  Search,
  Grid3X3,
  List,
  Shield,
  AlertTriangle,
  User,
  Check,
} from "lucide-react";

type ViewMode = "grid" | "list";

export default function FavoritesPage() {
  const { addToast } = useToast();
  const {
    favorites,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    deletePassword,
    toggleFavorite,
  } = usePasswordsQuery();

  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    "favorites-view-mode",
    "grid",
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter favorites by search
  const filteredFavorites = useMemo(() => {
    if (!searchQuery) return favorites;
    const query = searchQuery.toLowerCase();
    return favorites.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.username?.toLowerCase().includes(query) ||
        p.url?.toLowerCase().includes(query),
    );
  }, [favorites, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const weak = favorites.filter((p) => p.passwordStrength <= 1).length;
    const compromised = favorites.filter((p) => p.isCompromised).length;
    const reused = favorites.filter((p) => p.isReused).length;
    return { weak, compromised, reused, total: favorites.length };
  }, [favorites]);

  const handleCopyPassword = async (password: string) => {
    await navigator.clipboard.writeText(password);
    addToast({
      type: "success",
      title: "Copied!",
      message: "Password copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => navigator.clipboard.writeText(""), 30000);
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
        message: "Could not delete the password",
      });
    }
  };

  return (
    <DashboardWrapper>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header - Always visible */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Favorite Passwords
            </h1>
            <p className="text-muted-foreground text-lg">
              {isPending ? (
                <span className="inline-block h-6 w-64 bg-accent animate-pulse rounded-md" />
              ) : (
                `${favorites.length} favorite password${favorites.length !== 1 ? "s" : ""} marked for quick access`
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
              {[1, 2].map((i) => (
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
                <Skeleton className="h-11 w-32 rounded-2xl" />
                <Skeleton className="h-11 w-11 rounded-2xl" />
              </div>
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
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
                Failed to load favorites
              </h2>
              <p className="text-muted-foreground mt-1">
                {error?.message || "An error occurred"}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isPending && !isError && favorites.length === 0 && (
          <EmptyState
            icon={<Star className="h-8 w-8 text-muted-foreground" />}
            title="No favorites yet"
            description="Star your most-used passwords for quick access"
            action={
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/vault">Back to Vault</Link>
              </Button>
            }
          />
        )}

        {/* Data loaded successfully */}
        {!isPending && !isError && favorites.length > 0 && (
          <>
            {/* Security Stats */}
            {(stats.weak > 0 || stats.compromised > 0 || stats.reused > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.weak > 0 && (
                  <div className="flex items-center gap-4 p-5 rounded-3xl border bg-orange-500/10 border-orange-500/50 shadow-sm">
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
                  </div>
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
                  placeholder="Search favorites..."
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

            {/* Results */}
            {filteredFavorites.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8 text-muted-foreground" />}
                title="No results found"
                description="Try adjusting your search query"
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
            ) : (
              <>
                {/* Favorites Grid/List */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFavorites.map((entry) => (
                      <FavoriteCard
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
                    {filteredFavorites.map((entry) => (
                      <FavoriteCard
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
              </>
            )}
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}

interface FavoriteCardProps {
  entry: ReturnType<typeof usePasswordsQuery>["favorites"][0];
  compact?: boolean;
  onCopyPassword: (password: string) => void;
  onCopyUsername: (username: string) => void;
  onDelete: (id: string, title: string) => void;
  onToggleFavorite: (id: string) => void;
}

function FavoriteCard({
  entry,
  compact,
  onCopyPassword,
  onCopyUsername,
  onDelete,
  onToggleFavorite,
}: FavoriteCardProps) {
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
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
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
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={() => onToggleFavorite(entry._id)}>
                <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
                Remove from favorites
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
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
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
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => onToggleFavorite(entry._id)}>
              <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
              Remove from favorites
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
