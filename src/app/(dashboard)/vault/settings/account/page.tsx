"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle, UserX } from "lucide-react";
import { Button, Input, Modal, DashboardWrapper } from "@/components/ui";

export default function AccountSettingsPage() {
  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmation !== "DELETE") return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Delete account failed:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmation]);

  return (
    <DashboardWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/vault/settings">
            <Button variant="ghost" className="p-2 rounded-2xl mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Account</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">
              Danger Zone
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Actions in this section are irreversible. Please proceed with
            caution.
          </p>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <UserX className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This
                  includes all your passwords, categories, and settings. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation("");
        }}
        title="Delete Account"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">
                This action cannot be undone
              </p>
              <p className="text-muted-foreground">
                All your passwords, categories, and account data will be
                permanently deleted.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-mono text-destructive">DELETE</span> to
              confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              disabled={deleteConfirmation !== "DELETE"}
              className="flex-1"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardWrapper>
  );
}
