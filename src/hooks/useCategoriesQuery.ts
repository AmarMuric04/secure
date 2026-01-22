"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@/types";

type CategoryInput = { name: string; icon: string; color: string };

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/vault/categories", {
    credentials: "include",
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to fetch categories");
  }

  const json = await response.json();
  return json.data as Category[];
}

async function createCategoryApi(data: CategoryInput) {
  const response = await fetch("/api/vault/categories", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to create category");
  }

  const json = await response.json();
  return json.data.category as Category;
}

async function deleteCategoryApi(id: string) {
  const response = await fetch(`/api/vault/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to delete category");
  }
}

export function useCategoriesQuery() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryInput) => createCategoryApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isPending: categoriesQuery.isPending,
    isFetching: categoriesQuery.isFetching,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,

    // mutations
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hook to prefetch categories on hover for faster navigation
 */
export function usePrefetchCategories() {
  const queryClient = useQueryClient();

  return {
    prefetch: async () => {
      await queryClient.prefetchQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}
