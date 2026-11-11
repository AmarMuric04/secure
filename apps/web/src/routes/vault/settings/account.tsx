import { createFileRoute } from "@tanstack/react-router";

import { AccountSettingsPage } from "@/components/pages";

export const Route = createFileRoute("/vault/settings/account")({
	component: AccountSettingsPage,
});
