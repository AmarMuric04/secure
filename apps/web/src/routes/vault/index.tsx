import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { VaultPage } from "@/components/pages";

export const Route = createFileRoute("/vault/")({
	validateSearch: z.object({
		category: z.string().optional(),
		filter: z.enum(["favorites"]).optional(),
		entry: z.string().optional(),
	}),
	component: VaultPage,
});
