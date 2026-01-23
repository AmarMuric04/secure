"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Check, X, Lock } from "lucide-react";
import {
  Button,
  Input,
  Spinner,
  DashboardWrapper,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EmptyState,
} from "@repo/ui";
import { usePasswordsQuery, useCategoriesQuery } from "@/hooks";
import { cn } from "@/lib/utils";

// Form component that only renders when we have the password data
function EditForm({
  existingPassword,
  updatePassword,
  generateSecurePassword,
  analyzeStrength,
  categories,
}: {
  existingPassword: {
    _id: string;
    title: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
    categoryId?: string;
  };
  updatePassword: (
    id: string,
    updates: Record<string, unknown>,
  ) => Promise<unknown>;
  generateSecurePassword: (options?: Record<string, unknown>) => string;
  analyzeStrength: (password: string) => number;
  categories: Array<{ _id: string; name: string }>;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(existingPassword.title);
  const [username, setUsername] = useState(existingPassword.username || "");
  const [password, setPassword] = useState(existingPassword.password);
  const [url, setUrl] = useState(existingPassword.url || "");
  const [notes, setNotes] = useState(existingPassword.notes || "");
  const [categoryId, setCategoryId] = useState(
    existingPassword.categoryId || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    if (!password) return null;
    return analyzeStrength(password);
  }, [password, analyzeStrength]);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword({
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    setPassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsSaving(true);
    const success = await updatePassword(existingPassword._id, {
      title: title.trim(),
      username: username.trim() || undefined,
      password: password,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      categoryId: categoryId || undefined,
    });

    if (success) {
      router.push(`/vault/${existingPassword._id}`);
    } else {
      setError("Failed to update password. Please try again.");
    }
    setIsSaving(false);
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Strong";
      case 4:
        return "Very Strong";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <Link href={`/vault/${existingPassword._id}`}>
            <Button variant="ghost" className="p-2 rounded-2xl mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Edit Password
            </h1>
            <p className="text-muted-foreground text-lg">
              Update your password details
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-2xl">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Password Details
              </h2>
            </div>

            {/* Title */}
            <Input
              label="Title"
              placeholder="e.g., Gmail, Netflix, Bank"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Username */}
            <Input
              label="Username / Email"
              placeholder="username@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 px-4 py-2 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGeneratePassword}
                  className="gap-2 rounded-2xl px-5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </Button>
              </div>

              {/* Password Strength Meter */}
              {passwordStrength !== null && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-2 flex-1 rounded-full transition-all duration-300",
                          i <= passwordStrength
                            ? getStrengthColor(passwordStrength)
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Strength: {getStrengthText(passwordStrength)}
                  </p>
                </div>
              )}
            </div>

            {/* Website URL */}
            <Input
              label="Website URL"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Select
                value={categoryId || "none"}
                onValueChange={(value) =>
                  setCategoryId(value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="w-full h-11 rounded-2xl">
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                placeholder="Additional notes (encrypted)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] resize-none transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border shadow-lg">
            <Link href={`/vault/${existingPassword._id}`} className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="gap-2 w-full h-12 rounded-2xl text-base font-semibold"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 flex-1 h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
            >
              {isSaving ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function EditPasswordPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    passwords,
    isPending,
    updatePassword,
    generateSecurePassword,
    analyzeStrength,
  } = usePasswordsQuery();
  const { categories } = useCategoriesQuery();

  const existingPassword = passwords.find((p) => p._id === id) ?? null;

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

  if (!existingPassword) {
    return (
      <DashboardWrapper>
        <EmptyState
          icon={<Lock className="h-8 w-8 text-muted-foreground" />}
          title="Password not found"
          description="This password may have been deleted"
          action={
            <Link href="/vault">
              <Button variant="secondary" className="rounded-2xl">
                Back to Vault
              </Button>
            </Link>
          }
        />
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <EditForm
        existingPassword={existingPassword}
        updatePassword={updatePassword}
        generateSecurePassword={generateSecurePassword}
        analyzeStrength={analyzeStrength}
        categories={categories}
      />
    </DashboardWrapper>
  );
}
