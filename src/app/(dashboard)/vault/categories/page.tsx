"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";
import { usePasswordsQuery, useCategoriesQuery } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Button,
  Input,
  Skeleton,
  DashboardWrapper,
  EmptyState,
  useToast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import type { Category } from "@/types";
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  X,
  CreditCard,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Wallet,
  Key,
  Building2,
  Gamepad2,
  ShoppingBag,
  Plane,
  Heart,
  GraduationCap,
  Briefcase,
  Grid3X3,
  List,
  type LucideProps,
} from "lucide-react";

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  folder: FolderOpen,
  "credit-card": CreditCard,
  globe: Globe,
  smartphone: Smartphone,
  mail: Mail,
  lock: Lock,
  wallet: Wallet,
  key: Key,
  building: Building2,
  gamepad: Gamepad2,
  shopping: ShoppingBag,
  plane: Plane,
  heart: Heart,
  education: GraduationCap,
  work: Briefcase,
};

const availableIcons = Object.keys(iconMap);

const colorOptions = [
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

type ViewMode = "grid" | "list";

// useCategoriesQuery provides data & mutations

export default function CategoriesPage() {
  const { addToast } = useToast();
  const { passwords } = usePasswordsQuery();
  const {
    categories,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    createCategory,
    isCreating,
    deleteCategory,
    updateCategory,
    isUpdating,
  } = useCategoriesQuery();

  // UI State
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    "categories-view-mode",
    "grid",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("folder");
  const [newCategoryColor, setNewCategoryColor] = useState("#6b7280");

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("folder");
  const [editCategoryColor, setEditCategoryColor] = useState("#6b7280");

  // We'll call createCategory / deleteCategory from the hook and show toasts

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter((c: Category) =>
      c.name.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  // Count passwords per category
  const passwordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    passwords.forEach((p) => {
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [passwords]);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      addToast({
        type: "error",
        title: "Name required",
        message: "Please enter a category name",
      });
      return;
    }

    createCategory({
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: newCategoryColor,
    })
      .then(() => {
        setShowCreateModal(false);
        setNewCategoryName("");
        setNewCategoryIcon("folder");
        setNewCategoryColor("#6b7280");
        addToast({
          type: "success",
          title: "Category created",
          message: "Your new category has been created successfully",
        });
      })
      .catch((err: unknown) => {
        const message = (err as Error)?.message || "Failed to create category";
        addToast({
          type: "error",
          title: "Failed to create category",
          message,
        });
      });
  };

  const handleDeleteCategory = (
    id: string,
    name: string,
    isLocked: boolean,
    isDefault: boolean,
  ) => {
    if (isLocked || isDefault) {
      addToast({
        type: "error",
        title: "Cannot delete",
        message: "This is a default category and cannot be deleted",
      });
      return;
    }

    if (passwordCounts[id] > 0) {
      addToast({
        type: "error",
        title: "Cannot delete",
        message: `This category contains ${passwordCounts[id]} password(s). Move them first.`,
      });
      return;
    }

    deleteCategory(id)
      .then(() => {
        addToast({
          type: "success",
          title: "Category deleted",
          message: "The category has been deleted",
        });
      })
      .catch((err: unknown) => {
        const message = (err as Error)?.message || "Failed to delete";
        addToast({ type: "error", title: "Failed to delete", message });
      });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryIcon(category.icon);
    setEditCategoryColor(category.color);
  };

  const handleSaveEdit = () => {
    if (!editingCategory || !editCategoryName.trim()) {
      addToast({
        type: "error",
        title: "Name required",
        message: "Please enter a category name",
      });
      return;
    }

    updateCategory(editingCategory._id, {
      name: editCategoryName.trim(),
      icon: editCategoryIcon,
      color: editCategoryColor,
    })
      .then(() => {
        setEditingCategory(null);
        addToast({
          type: "success",
          title: "Category updated",
          message: "Your category has been updated successfully",
        });
      })
      .catch((err: unknown) => {
        const message = (err as Error)?.message || "Failed to update category";
        addToast({
          type: "error",
          title: "Failed to update",
          message,
        });
      });
  };

  return (
    <DashboardWrapper>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header - Always visible */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Categories
            </h1>
            <p className="text-muted-foreground text-lg">
              {isPending ? (
                <span className="inline-block h-6 w-72 bg-accent animate-pulse rounded-md" />
              ) : (
                `Organize your passwords with ${categories.length} ${categories.length === 1 ? "category" : "categories"}`
              )}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* Loading State */}
        {isPending && (
          <>
            {/* Search and Controls Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Skeleton className="flex-1 h-11 rounded-2xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-32 rounded-2xl" />
                <Skeleton className="h-11 w-11 rounded-2xl" />
              </div>
            </div>

            {/* Categories Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-card rounded-3xl border shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
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
                Failed to load categories
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

        {/* Data loaded successfully */}
        {!isPending && !isError && (
          <>
            {/* Search and Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories..."
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

            {/* Categories Grid/List */}
            {filteredCategories.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="h-8 w-8 text-muted-foreground" />}
                title={
                  searchQuery ? "No categories found" : "No categories yet"
                }
                description={
                  searchQuery
                    ? "Try adjusting your search"
                    : "Create your first category to organize passwords"
                }
                action={
                  !searchQuery ? (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="rounded-2xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  ) : undefined
                }
              />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((category) => {
                  const IconComponent = iconMap[category.icon] || FolderOpen;
                  const count = passwordCounts[category._id] || 0;

                  return (
                    <div
                      key={category._id}
                      className="group relative p-5 bg-card rounded-3xl border hover:border-primary transition-all shadow-sm hover:shadow-md"
                    >
                      <Link
                        href={`/vault?category=${category._id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div
                            className="h-12 w-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent
                              className="h-6 w-6"
                              style={{ color: category.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {category.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {count} password{count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </Link>

                      {/* Actions */}
                      {!category.isLocked && !category.isDefault && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 rounded-xl bg-background/90 backdrop-blur text-muted-foreground hover:text-foreground transition-colors shadow-md">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-lg"
                            >
                              <DropdownMenuItem
                                onClick={() => handleEditCategory(category)}
                                className="rounded-md"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteCategory(
                                    category._id,
                                    category.name,
                                    category.isLocked,
                                    category.isDefault,
                                  )
                                }
                                className="text-destructive focus:text-destructive rounded-md"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {category.isDefault && (
                        <span className="absolute bottom-3 right-3 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                          Default
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category) => {
                  const IconComponent = iconMap[category.icon] || FolderOpen;
                  const count = passwordCounts[category._id] || 0;

                  return (
                    <div
                      key={category._id}
                      className="group flex items-center gap-4 p-5 bg-card rounded-3xl border hover:bg-accent/30 transition-all shadow-sm"
                    >
                      <Link
                        href={`/vault?category=${category._id}`}
                        className="flex items-center gap-4 flex-1 min-w-0"
                      >
                        <div
                          className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent
                            className="h-6 w-6"
                            style={{ color: category.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">
                              {category.name}
                            </p>
                            {category.isDefault && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {count} password{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </Link>

                      {/* Actions */}
                      {!category.isLocked && !category.isDefault && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditCategory(category)}
                              className="rounded-md"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteCategory(
                                  category._id,
                                  category.name,
                                  category.isLocked,
                                  category.isDefault,
                                )
                              }
                              className="text-destructive focus:text-destructive rounded-md"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Create Category Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border p-6 w-full max-w-md mx-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      Create Category
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Category Name"
                      placeholder="e.g., Social Media, Banking"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />

                    {/* Icon Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Icon
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableIcons.map((icon) => {
                          const Icon = iconMap[icon];
                          return (
                            <button
                              key={icon}
                              onClick={() => setNewCategoryIcon(icon)}
                              className={cn(
                                "p-2 rounded-lg border transition-colors",
                                newCategoryIcon === icon
                                  ? "border-primary bg-primary/10"
                                  : "border-transparent bg-muted hover:bg-accent",
                              )}
                            >
                              <Icon className="h-5 w-5 text-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setNewCategoryColor(color.value)}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-all",
                              newCategoryColor === color.value
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105",
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCategory}
                      isLoading={isCreating}
                    >
                      Create Category
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border p-6 w-full max-w-md mx-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      Edit Category
                    </h2>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Category Name"
                      placeholder="e.g., Social Media, Banking"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                    />

                    {/* Icon Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Icon
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableIcons.map((icon) => {
                          const Icon = iconMap[icon];
                          return (
                            <button
                              key={icon}
                              onClick={() => setEditCategoryIcon(icon)}
                              className={cn(
                                "p-2 rounded-lg border transition-colors",
                                editCategoryIcon === icon
                                  ? "border-primary bg-primary/10"
                                  : "border-transparent bg-muted hover:bg-accent",
                              )}
                            >
                              <Icon className="h-5 w-5 text-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setEditCategoryColor(color.value)}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-all",
                              editCategoryColor === color.value
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105",
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} isLoading={isUpdating}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}
