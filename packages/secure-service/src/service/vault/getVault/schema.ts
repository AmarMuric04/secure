import { z } from "zod";

import { categorySchema, encryptedEntrySchema } from "../../../schemas";

const vaultSchema = z.object({
	passwords: z.array(encryptedEntrySchema),
	categories: z.array(categorySchema),
});

export { vaultSchema };
