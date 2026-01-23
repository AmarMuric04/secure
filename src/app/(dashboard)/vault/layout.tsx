"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useVaultStore } from "@/stores";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardLayout } from "@repo/ui";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

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
            setIsInitialized(true);
            return;
          } catch (error) {
            console.error("[VaultLayout] Failed to import key:", error);
            sessionStorage.removeItem("vault_key");
          }
        }

        // No stored key found
        // For OAuth users: generate a new random key (they don't have password-derived keys)
        // For credential users: auto-logout and redirect to login to derive key from password
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
          setIsInitialized(true);
        } else {
          // Credential users: encryption key is lost, must re-login to derive it
          console.warn(
            "[VaultLayout] Encryption key missing for credential user - forcing re-login",
          );
          await signOut({ redirect: false });
          router.push("/login?reason=session_expired");
          return;
        }
      } else if (status === "authenticated" && encryptionKey) {
        setIsInitialized(true);
      }
    };

    initializeVaultKey();
  }, [status, session, encryptionKey, setEncryptionKey, router]);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Show loading while initializing
  if (status === "loading" || (status === "authenticated" && !isInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Unlocking vault...
        </div>
      </div>
    );
  }

  return <DashboardLayout sidebar={<AppSidebar />}>{children}</DashboardLayout>;
}
