import { requestApi } from "../../../client";
import { sessionsSchema } from "./schema";

const getSessions = () =>
	requestApi({ path: "/api/auth/sessions", schema: sessionsSchema });

export { getSessions };
