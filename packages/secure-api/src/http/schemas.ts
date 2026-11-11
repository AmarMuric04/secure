import { z } from "zod";

const emailSchema = z
	.email()
	.max(254)
	.transform((email) => email.trim().toLowerCase());

const authHashSchema = z.string().regex(/^[a-f\d]{64}$/);

const saltSchema = z.string().regex(/^[a-f\d]{32,64}$/);

const encryptedVaultKeySchema = z
	.string()
	.max(256)
	.regex(/^v2\.[\w+/=-]+\.[\w+/=-]+$/);

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

const totpCodeSchema = z.string().regex(/^\d{6}$/);

const passwordMetadataSchema = z.object({
	categoryId: objectIdSchema.nullable(),
	tags: z.array(z.string().trim().min(1).max(50)).max(20),
	favorite: z.boolean(),
	passwordStrength: z.int().min(0).max(4),
	isCompromised: z.boolean(),
	isReused: z.boolean(),
});

const passwordEntryBodySchema = z.object({
	encryptedData: z.string().min(1).max(100_000),
	iv: z.string().min(1).max(64),
	metadata: passwordMetadataSchema,
});

const passwordEntryUpdateBodySchema = passwordEntryBodySchema.extend({
	isPasswordChanged: z.boolean(),
});

const breachFlagBodySchema = z.object({ isCompromised: z.boolean() });

const BULK_ENTRY_LIMIT = 200;

const bulkPasswordEntriesBodySchema = z.object({
	entries: z.array(passwordEntryBodySchema).min(1).max(BULK_ENTRY_LIMIT),
});

const settingsSchema = z
	.object({
		theme: z.enum(["light", "dark", "system"]),
		autoLockMinutes: z.union([
			z.literal(1),
			z.literal(5),
			z.literal(15),
			z.literal(30),
			z.literal(60),
		]),
		clearClipboardSeconds: z.union([
			z.literal(30),
			z.literal(60),
			z.literal(90),
			z.literal(120),
		]),
		showPasswordStrength: z.boolean(),
		emailOnNewLogin: z.boolean(),
		emailOnPasswordChange: z.boolean(),
		emailSecurityAlerts: z.boolean(),
		defaultView: z.enum(["grid", "list"]),
		defaultSort: z.enum(["name", "updated", "created"]),
		showFavicons: z.boolean(),
		passwordMaxAgeDays: z.union([
			z.literal(0),
			z.literal(30),
			z.literal(60),
			z.literal(90),
			z.literal(180),
			z.literal(365),
		]),
	})
	.partial();

export {
	authHashSchema,
	emailSchema,
	encryptedVaultKeySchema,
	objectIdSchema,
	breachFlagBodySchema,
	bulkPasswordEntriesBodySchema,
	passwordEntryBodySchema,
	passwordEntryUpdateBodySchema,
	saltSchema,
	settingsSchema,
	totpCodeSchema,
};
