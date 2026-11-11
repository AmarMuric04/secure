import { createFileRoute } from "@tanstack/react-router";

import { SecuritySettingsPage } from "@/components/pages";

export const Route = createFileRoute("/vault/settings/security")({
	component: SecuritySettingsPage,
});
