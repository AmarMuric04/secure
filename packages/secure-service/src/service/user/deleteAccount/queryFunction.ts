import { requestApi } from "../../../client";
import { noContentSchema } from "../../../schemas";

const deleteAccount = (authHash: string) =>
	requestApi({
		method: "DELETE",
		path: "/api/user/profile",
		body: { authHash },
		schema: noContentSchema,
	});

export { deleteAccount };
