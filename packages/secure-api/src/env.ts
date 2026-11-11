import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	MONGODB_URI: z.string().min(1),
	SERVER_SECRET: z.string().min(32),
	GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
	SMTP_HOST: z.string().min(1).optional(),
	SMTP_PORT: z.coerce.number().int().positive().default(587),
	SMTP_SECURE: z
		.enum(["true", "false"])
		.default("false")
		.transform((value) => value === "true"),
	SMTP_USER: z.string().min(1).optional(),
	SMTP_PASSWORD: z.string().min(1).optional(),
	SMTP_FROM: z.string().min(1).optional(),
});

const withoutBlankValues = (source: NodeJS.ProcessEnv) =>
	Object.fromEntries(
		Object.entries(source).filter(([, value]) => !!value?.trim()),
	);

let cachedEnv: z.infer<typeof envSchema> | undefined;

const getEnv = () => {
	cachedEnv ??= envSchema.parse(withoutBlankValues(process.env));

	return cachedEnv;
};

const isProduction = () => getEnv().NODE_ENV === "production";

export { getEnv, isProduction };
