"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Loader2, Check } from "lucide-react";
import { Button, Input, DashboardWrapper } from "@/components/ui";
import Link from "next/link";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setIsLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        await updateSession({ name });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/vault/settings">
            <Button variant="ghost" className="p-2 rounded-2xl mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground text-lg">
              Update your personal information
            </p>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
              {name?.charAt(0).toUpperCase() ||
                email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Profile Picture
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Your avatar is generated from your name
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="rounded-2xl border bg-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Personal Information
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />

            <Input
              label="Email Address"
              value={email}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Email cannot be changed
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => router.push("/vault/settings")}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
