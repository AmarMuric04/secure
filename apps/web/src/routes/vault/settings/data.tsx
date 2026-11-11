import { createFileRoute } from "@tanstack/react-router";

import { DataSettingsPage } from "@/components/pages";

export const Route = createFileRoute("/vault/settings/data")({
	component: DataSettingsPage,
});
