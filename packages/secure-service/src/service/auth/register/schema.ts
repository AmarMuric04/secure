import { z } from "zod";

const registrationSchema = z.object({ token: z.string() });

export { registrationSchema };
