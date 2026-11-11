import { createFileRoute } from "@tanstack/react-router";

import { EditPasswordPage } from "@/components/pages";

export const Route = createFileRoute("/vault/$id/edit")({
	component: EditPasswordPage,
});
