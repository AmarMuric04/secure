"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Checkbox } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { usePasswordsQuery } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Star,
  Tag,
  Zap,
  Lock,
} from "lucide-react";

export default function NewPasswordPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const {
    createPassword,
    generateSecurePassword,
    generateSecurePassphrase,
    analyzeStrength,
    isCreating,
  } = usePasswordsQuery();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Password generation options
  const [genLength, setGenLength] = useState(20);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);

  const strength = password ? analyzeStrength(password) : null;

  const handleGeneratePassword = useCallback(() => {
    const generated = generateSecurePassword({
      length: genLength,
      includeUppercase: genUppercase,
      includeLowercase: genLowercase,
      includeNumbers: genNumbers,
      includeSymbols: genSymbols,
    });
    setPassword(generated);
    setShowPassword(true);
  }, [
    genLength,
    genUppercase,
    genLowercase,
    genNumbers,
    genSymbols,
    generateSecurePassword,
  ]);

  const handleGeneratePassphrase = useCallback(() => {
    const generated = generateSecurePassphrase({
      wordCount: 4,
      separator: "-",
      capitalize: true,
      includeNumber: true,
    });
    setPassword(generated);
    setShowPassword(true);
  }, [generateSecurePassphrase]);

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(password);
    addToast({
      type: "success",
      title: "Copied!",
      message: "Password copied to clipboard",
      duration: 2000,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !password) {
      addToast({
        type: "error",
        title: "Missing fields",
        message: "Title and password are required",
      });
      return;
    }

    try {
      await createPassword({
        title,
        username: username || undefined,
        password,
        url: url || undefined,
        notes: notes || undefined,
        tags,
        favorite,
      });

      addToast({
        type: "success",
        title: "Password saved!",
        message: "Your password has been securely encrypted and stored",
      });
      router.push("/vault");
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed to save password",
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add Password
        </h1>
        <p className="text-muted-foreground text-lg">
          Store a new password securely in your vault
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-3xl border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Password Details
            </h2>
          </div>

          <Input
            label="Title"
            placeholder="e.g., Gmail, Netflix, Bank"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Username / Email"
            placeholder="your-email@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter or generate a password"
                  className="w-full h-11 px-4 py-2 pr-24 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    disabled={!password}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl transition-colors font-medium shadow-sm flex items-center gap-2"
                title="Generate password"
              >
                <RefreshCw className="h-4 w-4" />
                Generate
              </button>
            </div>

            {/* Strength indicator */}
            {strength !== null && (
              <div className="mt-3">
                <div className="flex gap-1.5 mb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-all duration-300",
                        i <= strength
                          ? [
                              "bg-red-500",
                              "bg-orange-500",
                              "bg-yellow-500",
                              "bg-lime-500",
                              "bg-green-500",
                            ][strength]
                          : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {
                      ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][
                        strength
                      ]
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Password Generator Options */}
          <div className="bg-muted/30 rounded-2xl p-6 space-y-5 border border-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Generator Options
                </span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassphrase}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Use passphrase
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-foreground min-w-15">
                Length:
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={genLength}
                onChange={(e) => setGenLength(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-bold w-10 text-right bg-primary/10 text-primary px-3 py-1.5 rounded-xl">
                {genLength}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <Checkbox
                  checked={genUppercase}
                  onCheckedChange={(checked) =>
                    setGenUppercase(checked as boolean)
                  }
                  className="border-input"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Uppercase (A-Z)
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <Checkbox
                  checked={genLowercase}
                  onCheckedChange={(checked) =>
                    setGenLowercase(checked as boolean)
                  }
                  className="border-input"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Lowercase (a-z)
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <Checkbox
                  checked={genNumbers}
                  onCheckedChange={(checked) =>
                    setGenNumbers(checked as boolean)
                  }
                  className="border-input"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Numbers (0-9)
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <Checkbox
                  checked={genSymbols}
                  onCheckedChange={(checked) =>
                    setGenSymbols(checked as boolean)
                  }
                  className="border-input"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Symbols (!@#$)
                </span>
              </label>
            </div>
          </div>

          <Input
            label="Website URL"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        {/* Additional Info */}
        <div className="bg-card rounded-3xl border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Additional Details
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={4}
              className="w-full px-4 py-3 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] resize-none transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-medium"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-primary/70 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                placeholder="Add a tag..."
                className="flex-1 h-11 px-4 py-2 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] text-sm transition-all"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                className="rounded-2xl"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Favorite */}
          <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-muted/50 transition-colors">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={cn(
                "p-3 rounded-2xl transition-all shadow-sm",
                favorite
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20"
                  : "bg-muted text-muted-foreground group-hover:bg-muted/80",
              )}
            >
              <Star className={cn("h-6 w-6", favorite && "fill-current")} />
            </button>
            <div>
              <div className="font-medium text-foreground">
                Add to favorites
              </div>
              <div className="text-sm text-muted-foreground">
                Mark this password for quick access
              </div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 sticky bottom-0 bg-background pt-4 pb-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 rounded-2xl text-base font-semibold"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
            isLoading={isCreating}
          >
            Save Password
          </Button>
        </div>
      </form>
    </div>
  );
}
