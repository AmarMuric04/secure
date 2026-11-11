import { z } from "zod";

const backupCodesSchema = z.object({ backupCodes: z.array(z.string()) });

export { backupCodesSchema };
