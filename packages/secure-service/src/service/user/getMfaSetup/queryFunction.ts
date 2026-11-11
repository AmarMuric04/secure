import { requestApi } from "../../../client";
import { mfaSetupSchema } from "./schema";

const getMfaSetup = () =>
	requestApi({ path: "/api/user/mfa", schema: mfaSetupSchema });

export { getMfaSetup };
