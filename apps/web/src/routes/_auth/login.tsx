import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginPage } from "@/components/pages";

export const Route = createFileRoute("/_auth/login")({
	validateSearch: z.object({
		step: z.literal("mfa").optional(),
		error: z.string().optional(),
	}),
	component: LoginPage,
});
