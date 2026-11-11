import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/components/pages";

export const Route = createFileRoute("/vault/settings/")({
	component: SettingsPage,
});
