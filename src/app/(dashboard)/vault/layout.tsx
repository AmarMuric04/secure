"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useVaultStore } from "@/stores";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [keyMissing, setKeyMissing] = useState(false);

  const { encryptionKey, setEncryptionKey } = useVaultStore();

  // Initialize encryption key
  useEffect(() => {
    const initializeVaultKey = async () => {
      if (status === "authenticated" && !encryptionKey) {
        // Check if we have a stored key in sessionStorage
        const storedKeyData = sessionStorage.getItem("vault_key");

        if (storedKeyData) {
          try {
            const keyData = JSON.parse(storedKeyData);
            const key = await crypto.subtle.importKey(
              "jwk",
              keyData,
              { name: "AES-GCM", length: 256 },
              true,
              ["encrypt", "decrypt"],
            );
            setEncryptionKey(key);
            setKeyMissing(false);
            return;
          } catch (error) {
            console.error("[VaultLayout] Failed to import key:", error);
            sessionStorage.removeItem("vault_key");
          }
        }

        // No stored key found
        // For OAuth users: generate a new random key (they don't have password-derived keys)
        // For credential users: they need to re-login to derive their key
        const isOAuthUser = session?.user?.provider === "google";

        if (isOAuthUser) {
          // OAuth users can use a new random key - their passwords will be fresh
          const newKey = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"],
          );
          const exportedKey = await crypto.subtle.exportKey("jwk", newKey);
          sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));
          setEncryptionKey(newKey);
          setKeyMissing(false);
        } else {
          // Credential users need to re-login to derive their encryption key
          // Their passwords are encrypted with a key derived from their master password
          console.warn(
            "[VaultLayout] Encryption key missing for credential user - re-login required",
          );
          setKeyMissing(true);
        }
      }
    };

    initializeVaultKey();
  }, [status, session, encryptionKey, setEncryptionKey]);

  // Handle re-login for credential users
  const handleReLogin = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Show locked screen if encryption key is missing for credential users
  if (keyMissing && status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Session Expired
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your vault encryption key has expired. Please log in again to
              decrypt your passwords.
            </p>
          </div>
          <Button onClick={handleReLogin} size="lg" className="w-full">
            Log In Again
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This happens when your browser session ends or you&apos;ve been away
            for a while.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
