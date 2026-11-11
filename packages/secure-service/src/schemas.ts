import { z } from "zod";

const settingsSchema = z.object({
	theme: z.enum(["light", "dark", "system"]).catch("system"),
	autoLockMinutes: z.number().catch(15),
	clearClipboardSeconds: z.number().catch(30),
	showPasswordStrength: z.boolean().catch(true),
	emailOnNewLogin: z.boolean().catch(true),
	emailOnPasswordChange: z.boolean().catch(true),
	emailSecurityAlerts: z.boolean().catch(true),
	defaultView: z.enum(["grid", "list"]).catch("grid"),
	defaultSort: z.enum(["name", "updated", "created"]).catch("name"),
	showFavicons: z.boolean().catch(false),
	passwordMaxAgeDays: z.number().catch(90),
});

const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	emailVerified: z.boolean(),
	name: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	authProvider: z.enum(["credentials", "google"]),
	mfaEnabled: z.boolean(),
	settings: settingsSchema,
	createdAt: z.string(),
});

const userResponseSchema = z.object({ user: userSchema });

const encryptedEntrySchema = z.object({
	id: z.string(),
	encryptedData: z.string(),
	iv: z.string(),
	categoryId: z.string().nullable(),
	tags: z.array(z.string()),
	favorite: z.boolean(),
	passwordStrength: z.number(),
	isCompromised: z.boolean(),
	isReused: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
	lastUsedAt: z.string().nullable(),
	passwordChangedAt: z.string().nullable(),
	deletedAt: z.string().nullable(),
});

const categorySchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string(),
	color: z.string(),
	order: z.number(),
	isDefault: z.boolean(),
	isLocked: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const entryMetadataSchema = z.object({
	categoryId: z.string().nullable(),
	tags: z.array(z.string()),
	favorite: z.boolean(),
	passwordStrength: z.number(),
	isCompromised: z.boolean(),
	isReused: z.boolean(),
});

const noContentSchema = z.null();

export {
	categorySchema,
	encryptedEntrySchema,
	entryMetadataSchema,
	noContentSchema,
	settingsSchema,
	userResponseSchema,
	userSchema,
};
