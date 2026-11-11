import { createFileRoute } from "@tanstack/react-router";

import { RegisterPage } from "@/components/pages";

export const Route = createFileRoute("/_auth/register")({
	component: RegisterPage,
});
