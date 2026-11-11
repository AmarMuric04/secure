import { createFactory } from "hono/factory";

const factory = createFactory<{
	Variables: { auth: { userId: string; sessionId: string } };
}>();

export { factory };
