import { z } from "zod";

import { encryptedEntrySchema } from "../../../schemas";

const restoredEntrySchema = z.object({ password: encryptedEntrySchema });

export { restoredEntrySchema };
