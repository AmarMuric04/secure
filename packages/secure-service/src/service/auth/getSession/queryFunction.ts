import { readErrorCause, requestApi } from "../../../client";
import { userResponseSchema } from "../../../schemas";

const getSession = async () => {
	try {
		const { user } = await requestApi({
			path: "/api/auth/session",
			schema: userResponseSchema,
		});

		return user;
	} catch (error) {
		if (readErrorCause(error)?.status === 401) {
			return null;
		}

		throw error;
	}
};

export { getSession };
