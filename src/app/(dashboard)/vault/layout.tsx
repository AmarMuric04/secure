"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useVaultStore } from "@/stores";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();

  const { encryptionKey, setEncryptionKey } = useVaultStore();

  // Initialize encryption key for OAuth users
  useEffect(() => {
    const initializeVaultKey = async () => {
      if (status === "authenticated" && !encryptionKey) {
        // For OAuth users, we need to generate or retrieve their encryption key
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
          } catch (error) {
            // Key import failed, generate new one
            console.error("[VaultLayout] Failed to import key:", error);
            sessionStorage.removeItem("vault_key");
          }
        }

        // If still no key, generate a new one for this session
        if (!useVaultStore.getState().encryptionKey) {
          const newKey = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"],
          );

          // Store in sessionStorage for this browser session
          const exportedKey = await crypto.subtle.exportKey("jwk", newKey);
          sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));

          setEncryptionKey(newKey);
        }
      }
    };

    initializeVaultKey();
  }, [status, encryptionKey, setEncryptionKey]);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
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
