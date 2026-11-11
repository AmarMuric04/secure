import { z } from "zod";

import { encryptedEntrySchema } from "../../../schemas";

const updatedEntrySchema = z.object({ password: encryptedEntrySchema });

export { updatedEntrySchema };
