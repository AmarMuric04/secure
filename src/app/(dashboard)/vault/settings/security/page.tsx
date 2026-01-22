"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Shield,
  Key,
  Smartphone,
  Check,
  Loader2,
  Copy,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
  Input,
  PasswordInput,
  Modal,
  DashboardWrapper,
} from "@/components/ui";
import Link from "next/link";

interface MfaSetupData {
  secret: string;
  otpauthUrl: string;
}

interface UserProfile {
  mfaEnabled: boolean;
}

export default function SecuritySettingsPage() {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // MFA state
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupData | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isEnablingMfa, setIsEnablingMfa] = useState(false);
  const [isLoadingMfaSetup, setIsLoadingMfaSetup] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserProfile(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    // TODO: Implement password change API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  // Start MFA setup
  const handleStartMfaSetup = async () => {
    setIsLoadingMfaSetup(true);
    setMfaError(null);
    setMfaSetupData(null);

    try {
      const response = await fetch("/api/user/mfa/setup");
      const result = await response.json();

      if (response.ok && result.success) {
        setMfaSetupData(result.data);
        setShowMfaSetup(true);
      } else {
        setMfaError(result.error?.message || "Failed to start MFA setup");
      }
    } catch (error) {
      console.error("Error starting MFA setup:", error);
      setMfaError("Failed to start MFA setup");
    } finally {
      setIsLoadingMfaSetup(false);
    }
  };

  // Enable MFA
  const handleEnableMfa = async () => {
    if (!mfaSetupData || mfaCode.length !== 6) return;

    setIsEnablingMfa(true);
    setMfaError(null);

    try {
      const response = await fetch("/api/user/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: mfaSetupData.secret,
          code: mfaCode,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBackupCodes(result.data.backupCodes);
        setShowMfaSetup(false);
        setShowBackupCodes(true);
        setMfaCode("");
        setMfaSetupData(null);
        await fetchUserProfile();
      } else {
        setMfaError(result.error?.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error enabling MFA:", error);
      setMfaError("Failed to enable MFA");
    } finally {
      setIsEnablingMfa(false);
    }
  };

  // Disable MFA
  const handleDisableMfa = async () => {
    setIsDisablingMfa(true);

    try {
      const response = await fetch("/api/user/mfa/setup", {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error("Error disabling MFA:", error);
    } finally {
      setIsDisablingMfa(false);
    }
  };

  // Copy backup codes
  const handleCopyBackupCodes = () => {
    if (backupCodes) {
      navigator.clipboard.writeText(backupCodes.join("\n"));
    }
  };

  const mfaEnabled = userProfile?.mfaEnabled ?? false;

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Security
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your password and two-factor authentication
            </p>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
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
                      Your account is protected with an authenticator app
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisableMfa}
                  isLoading={isDisablingMfa}
                >
                  Disable
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                    <Smartphone className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      2FA is not enabled
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with an authenticator app
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartMfaSetup}
                  isLoading={isLoadingMfaSetup}
                >
                  Enable
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Change Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your master password
              </p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
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

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            {passwordSuccess && (
              <p className="text-sm text-green-500 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Password changed successfully
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleChangePassword}
                isLoading={isChangingPassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* MFA Setup Modal */}
        <Modal
          isOpen={showMfaSetup}
          onClose={() => {
            setShowMfaSetup(false);
            setMfaCode("");
            setMfaSetupData(null);
            setMfaError(null);
          }}
          title="Set Up Two-Factor Authentication"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Scan the QR code with your authenticator app (Google
              Authenticator, Authy, Microsoft Authenticator, etc.)
            </p>
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-4">
                {mfaSetupData ? (
                  <QRCodeSVG
                    value={mfaSetupData.otpauthUrl}
                    size={192}
                    level="M"
                  />
                ) : (
                  <div className="h-48 w-48 bg-muted flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            {mfaSetupData && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Or enter this code manually:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                    {mfaSetupData.secret}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(mfaSetupData.secret);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {mfaError && (
              <p className="text-sm text-destructive text-center">{mfaError}</p>
            )}
            <Input
              label="Enter 6-digit code from app"
              value={mfaCode}
              onChange={(e) =>
                setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowMfaSetup(false);
                  setMfaCode("");
                  setMfaSetupData(null);
                  setMfaError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnableMfa}
                disabled={mfaCode.length !== 6 || !mfaSetupData}
                isLoading={isEnablingMfa}
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        </Modal>

        {/* Backup Codes Modal */}
        <Modal
          isOpen={showBackupCodes}
          onClose={() => {
            setShowBackupCodes(false);
            setBackupCodes(null);
          }}
          title="Save Your Backup Codes"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <strong>Important:</strong> Save these backup codes in a secure
                location. Each code can only be used once to access your account
                if you lose your authenticator.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes?.map((code, index) => (
                <div key={index} className="text-center py-1">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCopyBackupCodes}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
              <Button
                onClick={() => {
                  setShowBackupCodes(false);
                  setBackupCodes(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardWrapper>
  );
}
