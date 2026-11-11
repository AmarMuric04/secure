import { z } from "zod";

const revokedSessionsSchema = z.object({ revokedSessions: z.number() });

export { revokedSessionsSchema };
