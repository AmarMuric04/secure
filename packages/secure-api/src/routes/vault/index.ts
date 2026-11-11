import { factory } from "../../http/factory";
import { categoryRoutes } from "./categories";
import { entryRoutes } from "./entries";
import { keyRoutes } from "./keys";

const vaultRoutes = factory
	.createApp()
	.route("/keys", keyRoutes)
	.route("/categories", categoryRoutes)
	.route("/", entryRoutes);

export { vaultRoutes };
