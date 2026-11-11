import { z } from "zod";

const upgradedKeySchema = z.object({ keyVersion: z.literal(2) });

export { upgradedKeySchema };
