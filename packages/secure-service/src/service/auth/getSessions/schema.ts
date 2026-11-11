import { z } from "zod";

const sessionsSchema = z.object({
	sessions: z.array(
		z.object({
			id: z.string(),
			userAgent: z.string().nullable(),
			ipAddress: z.string().nullable(),
			createdAt: z.string(),
			lastActiveAt: z.string(),
			isCurrent: z.boolean(),
		}),
	),
});

export { sessionsSchema };
