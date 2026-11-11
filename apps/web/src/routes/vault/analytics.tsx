import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsPage } from "@/components/pages";

export const Route = createFileRoute("/vault/analytics")({
	component: AnalyticsPage,
});
