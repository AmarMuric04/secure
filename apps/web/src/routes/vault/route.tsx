import { createFileRoute } from "@tanstack/react-router";

import { VaultLayout } from "@/components/layout";

export const Route = createFileRoute("/vault")({
	component: VaultLayout,
});
