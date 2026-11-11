import { createFileRoute } from "@tanstack/react-router";

import { ProfileSettingsPage } from "@/components/pages";

export const Route = createFileRoute("/vault/settings/profile")({
	component: ProfileSettingsPage,
});
