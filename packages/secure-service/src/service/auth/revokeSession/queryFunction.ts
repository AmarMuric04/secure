import { requestApi } from "../../../client";
import { noContentSchema } from "../../../schemas";

const revokeSession = (id: string) =>
	requestApi({
		method: "DELETE",
		path: `/api/auth/sessions/${encodeURIComponent(id)}`,
		schema: noContentSchema,
	});

export { revokeSession };
