"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  Shield,
  Download,
  LogOut,
  Settings2,
  ChevronRight,
  FileJson,
  FileText,
  Lock,
} from "lucide-react";
import { Button, DashboardWrapper, Modal } from "@repo/ui";
import { usePasswordsQuery, useCategoriesQuery } from "@/hooks";

export default function SettingsPage() {
  const { passwords } = usePasswordsQuery();
  const { categories } = useCategoriesQuery();

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [isExporting, setIsExporting] = useState(false);

  // Create category name lookup
  const categoryNameMap = categories.reduce(
    (acc, cat) => {
      acc[cat._id] = cat.name;
      return acc;
    },
    {} as Record<string, string>,
  );

  const handleExport = useCallback(async () => {
    if (passwords.length === 0) {
      alert("No passwords to export.");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = passwords.map((p) => ({
        title: p.title,
        username: p.username || "",
        password: p.password || "",
        url: p.url || "",
        notes: p.notes || "",
        category: p.categoryId ? categoryNameMap[p.categoryId] || "" : "",
        favorite: p.favorite,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      let content: string;
      let mimeType: string;
      let filename: string;

      if (exportFormat === "json") {
        content = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        filename = `vault-export-${new Date().toISOString().split("T")[0]}.json`;
      } else {
        const headers = [
          "Title",
          "Username",
          "Password",
          "URL",
          "Notes",
          "Category",
          "Favorite",
          "Created At",
          "Updated At",
        ];
        const rows = exportData.map((p) => [
          p.title,
          p.username,
          p.password,
          p.url,
          p.notes,
          p.category,
          p.favorite ? "Yes" : "No",
          String(p.createdAt),
          String(p.updatedAt),
        ]);

        const escapeCsv = (value: string) => {
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        };

        content = [
          headers.join(","),
          ...rows.map((row) => row.map(escapeCsv).join(",")),
        ].join("\n");
        mimeType = "text/csv";
        filename = `vault-export-${new Date().toISOString().split("T")[0]}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [passwords, exportFormat, categoryNameMap]);

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/login" });
  }, []);

  const settingsItems = [
    {
      type: "link" as const,
      href: "/vault/settings/profile",
      icon: User,
      label: "Profile",
      description: "Update your name and profile information",
    },
    {
      type: "link" as const,
      href: "/vault/settings/security",
      icon: Shield,
      label: "Security",
      description: "Manage 2FA and password settings",
    },
    {
      type: "link" as const,
      href: "/vault/settings/account",
      icon: Settings2,
      label: "Account",
      description: "Manage your account and danger zone",
    },
    {
      type: "action" as const,
      onClick: () => setShowExportModal(true),
      icon: Download,
      label: "Export Data",
      description: "Download your vault data as JSON or CSV",
    },
    {
      type: "action" as const,
      onClick: handleSignOut,
      icon: LogOut,
      label: "Sign Out",
      description: "Sign out of your account",
    },
  ];

  return (
    <DashboardWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isDanger = "variant" in item && item.variant === "danger";

            if (item.type === "link") {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors text-left ${
                  isDanger
                    ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${isDanger ? "bg-destructive/10" : "bg-muted"}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isDanger ? "text-destructive" : "text-foreground"}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${isDanger ? "text-destructive" : "text-foreground"}`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-sm ${isDanger ? "text-destructive/70" : "text-muted-foreground"}`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Vault Data"
      >
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Your passwords will be exported with decrypted values. Keep this
            file secure.
          </p>

          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("json")}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  exportFormat === "json"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <FileJson
                  className={`w-5 h-5 ${exportFormat === "json" ? "text-primary" : "text-muted-foreground"}`}
                />
                <div className="text-left">
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">
                    Structured data
                  </p>
                </div>
              </button>
              <button
                onClick={() => setExportFormat("csv")}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  exportFormat === "csv"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <FileText
                  className={`w-5 h-5 ${exportFormat === "csv" ? "text-primary" : "text-muted-foreground"}`}
                />
                <div className="text-left">
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">Spreadsheet</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500">Security Warning</p>
              <p className="text-muted-foreground">
                The exported file will contain your actual passwords. Store it
                securely.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              isLoading={isExporting}
              className="flex-1"
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardWrapper>
  );
}
