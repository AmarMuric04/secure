import { z } from "zod";

const createdEntriesSchema = z.object({ createdCount: z.number() });

export { createdEntriesSchema };
