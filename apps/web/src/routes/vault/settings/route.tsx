import { createFileRoute } from "@tanstack/react-router";

import { SettingsLayout } from "@/components/layout";

export const Route = createFileRoute("/vault/settings")({
	component: SettingsLayout,
});
