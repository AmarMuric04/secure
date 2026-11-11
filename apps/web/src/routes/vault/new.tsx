import { createFileRoute } from "@tanstack/react-router";

import { NewPasswordPage } from "@/components/pages";

export const Route = createFileRoute("/vault/new")({
	component: NewPasswordPage,
});
