"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Shield,
  Key,
  Bell,
  Palette,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Smartphone,
  Check,
  Loader2,
} from "lucide-react";
import {
  Button,
  Input,
  PasswordInput,
  Modal,
  ConfirmDialog,
  DashboardWrapper,
} from "@/components/ui";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // MFA state
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [isEnablingMfa, setIsEnablingMfa] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    // TODO: Implement profile update API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSavingProfile(false);
    setActiveSection(null);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    // TODO: Implement password change API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActiveSection(null);
  };

  const handleEnableMfa = async () => {
    setIsEnablingMfa(true);
    // TODO: Implement MFA enable API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsEnablingMfa(false);
    setShowMfaSetup(false);
    setMfaCode("");
  };

  const handleExportData = async () => {
    setIsExporting(true);
    // TODO: Implement data export
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // TODO: Implement account deletion API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDeleting(false);
    await signOut({ callbackUrl: "/login" });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // TODO: Fetch MFA status from API
  const mfaEnabled = false;

  const settingsSections = [
    {
      id: "profile",
      icon: User,
      title: "Profile",
      description: "Update your personal information",
    },
    {
      id: "password",
      icon: Key,
      title: "Change Password",
      description: "Update your master password",
    },
    {
      id: "mfa",
      icon: Shield,
      title: "Two-Factor Authentication",
      description: mfaEnabled ? "Enabled" : "Not enabled",
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Manage notification preferences",
    },
    {
      id: "appearance",
      icon: Palette,
      title: "Appearance",
      description: "Customize the look and feel",
    },
  ];

  return (
    <DashboardWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and preferences
          </p>
        </div>

        {/* User Info */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {user?.name || "User"}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-2">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() =>
                setActiveSection(
                  activeSection === section.id ? null : section.id,
                )
              }
              className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-muted-foreground transition-transform ${activeSection === section.id ? "rotate-90" : ""}`}
              />
            </button>
          ))}
        </div>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <div className="mt-4 rounded-xl border bg-card p-4 space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveSection(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} isLoading={isSavingProfile}>
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Password Section */}
        {activeSection === "password" && (
          <div className="mt-4 rounded-xl border bg-card p-4 space-y-4">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveSection(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                isLoading={isChangingPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        )}

        {/* MFA Section */}
        {activeSection === "mfa" && (
          <div className="mt-4 rounded-xl border bg-card p-4">
            {mfaEnabled ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      2FA is enabled
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm">
                  Disable
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                    <Smartphone className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      2FA is not enabled
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowMfaSetup(true)}>
                  Enable Two-Factor Authentication
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-8 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Data & Account
          </h3>

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Download className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download your vault data
                </p>
              </div>
            </div>
            {isExporting && <Loader2 className="h-4 w-4 animate-spin" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Log out of your account
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-left hover:border-destructive/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and data
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* MFA Setup Modal */}
        <Modal
          isOpen={showMfaSetup}
          onClose={() => setShowMfaSetup(false)}
          title="Set Up Two-Factor Authentication"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Scan the QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>
            <div className="flex justify-center">
              <div className="h-48 w-48 rounded-lg bg-white p-4">
                {/* QR Code placeholder */}
                <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  QR Code
                </div>
              </div>
            </div>
            <Input
              label="Enter Code from App"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowMfaSetup(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnableMfa}
                disabled={mfaCode.length !== 6}
                isLoading={isEnablingMfa}
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Account Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="This action cannot be undone. All your data will be permanently deleted."
          confirmText="Delete Account"
          isLoading={isDeleting}
        />
      </div>
    </DashboardWrapper>
  );
}
