import { createFileRoute } from "@tanstack/react-router";

import { TrashPage } from "@/components/pages";

export const Route = createFileRoute("/vault/trash")({
	component: TrashPage,
});
