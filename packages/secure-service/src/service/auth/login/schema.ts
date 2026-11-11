import { z } from "zod";

import { userSchema } from "../../../schemas";

const loginSchema = z.discriminatedUnion("status", [
	z.object({ status: z.literal("authenticated"), user: userSchema }),
	z.object({ status: z.literal("mfa"), mfaToken: z.string() }),
]);

export { loginSchema };
