import { requestApi } from "../../../client";
import { saltSchema } from "./schema";

const getSalt = (email: string) =>
	requestApi({
		method: "POST",
		path: "/api/auth/salt",
		body: { email },
		schema: saltSchema,
	});

export { getSalt };
