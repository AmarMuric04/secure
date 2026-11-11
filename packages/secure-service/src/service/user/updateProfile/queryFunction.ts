import type { z } from "zod";

import type { settingsSchema } from "../../../schemas";
import { requestApi } from "../../../client";
import { userResponseSchema } from "../../../schemas";

const updateProfile = (changes: {
	name?: string;
	settings?: Partial<z.infer<typeof settingsSchema>>;
}) =>
	requestApi({
		method: "PUT",
		path: "/api/user/profile",
		body: changes,
		schema: userResponseSchema,
	});

export { updateProfile };
