import { requestApi } from "../../../client";
import { revokedSessionsSchema } from "./schema";

const revokeOtherSessions = () =>
	requestApi({
		method: "DELETE",
		path: "/api/auth/sessions",
		schema: revokedSessionsSchema,
	});

export { revokeOtherSessions };
