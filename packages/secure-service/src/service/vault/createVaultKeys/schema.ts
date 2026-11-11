import { z } from "zod";

const keyVersionSchema = z.object({ keyVersion: z.literal(2) });

export { keyVersionSchema };
