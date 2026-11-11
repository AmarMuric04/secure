import { requestApi } from "../../../client";
import { noContentSchema } from "../../../schemas";

const logout = () =>
	requestApi({
		method: "POST",
		path: "/api/auth/logout",
		schema: noContentSchema,
	});

export { logout };
