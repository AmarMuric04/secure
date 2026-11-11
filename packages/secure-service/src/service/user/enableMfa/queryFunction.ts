import { requestApi } from "../../../client";
import { backupCodesSchema } from "./schema";

const enableMfa = (confirmation: { secret: string; code: string }) =>
	requestApi({
		method: "POST",
		path: "/api/user/mfa",
		body: confirmation,
		schema: backupCodesSchema,
	});

export { enableMfa };
