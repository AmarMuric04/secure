import { factory } from "../../http/factory";
import { credentialRoutes } from "./credentials";
import { googleRoutes } from "./google";
import { mfaRoutes } from "./mfa";
import { sessionRoutes } from "./session";

const authRoutes = factory
	.createApp()
	.route("/", credentialRoutes)
	.route("/", mfaRoutes)
	.route("/", sessionRoutes)
	.route("/", googleRoutes);

export { authRoutes };
export { verifySecondFactor } from "./mfa";
