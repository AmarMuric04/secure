import { z } from "zod";

const saltSchema = z.object({ salt: z.string() });

export { saltSchema };
