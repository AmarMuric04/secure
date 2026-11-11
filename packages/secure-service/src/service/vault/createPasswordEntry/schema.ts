import { z } from "zod";

import { encryptedEntrySchema } from "../../../schemas";

const passwordEntryResponseSchema = z.object({
	password: encryptedEntrySchema,
});

export { passwordEntryResponseSchema };
