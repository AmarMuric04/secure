import { z } from "zod";

const mfaSetupSchema = z.object({ secret: z.string(), otpauthUrl: z.string() });

export { mfaSetupSchema };
