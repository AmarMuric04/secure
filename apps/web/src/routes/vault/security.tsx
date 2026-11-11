import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { SecurityPage } from "@/components/pages";

export const Route = createFileRoute("/vault/security")({
	validateSearch: z.object({
		issue: z
			.enum(["compromised", "weak", "reused", "stale", "tidy"])
			.optional(),
	}),
	component: SecurityPage,
});
