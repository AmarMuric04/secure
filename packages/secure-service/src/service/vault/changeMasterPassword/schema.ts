import { z } from "zod";

const changedMasterPasswordSchema = z.object({
	revokedSessions: z.number(),
});

export { changedMasterPasswordSchema };
