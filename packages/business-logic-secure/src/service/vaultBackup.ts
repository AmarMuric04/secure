import { z } from "zod";

const BACKUP_FORMAT = "securevault-backup";
const BACKUP_VERSION = 1;
const BACKUP_FILE_EXTENSION = ".securevault";

const backupEnvelopeSchema = z.object({
	format: z.literal(BACKUP_FORMAT),
	version: z.literal(BACKUP_VERSION),
	kdf: z.object({
		name: z.literal("PBKDF2"),
		hash: z.literal("SHA-256"),
		iterations: z.int().min(100_000).max(10_000_000),
	}),
	salt: z.string().min(1),
	iv: z.string().min(1),
	ciphertext: z.string().min(1),
});

const backupPayloadSchema = z.object({
	categories: z.array(
		z.object({ name: z.string(), icon: z.string(), color: z.string() }),
	),
	entries: z.array(
		z.object({
			title: z.string(),
			username: z.string().optional(),
			password: z.string(),
			url: z.string().optional(),
			notes: z.string().optional(),
			customFields: z
				.array(
					z.object({
						name: z.string(),
						value: z.string(),
						type: z.enum(["text", "password", "hidden"]),
					}),
				)
				.optional(),
			totp: z.string().optional(),
			passwordHistory: z
				.array(
					z.object({ password: z.string(), changedAt: z.string() }),
				)
				.optional(),
			categoryName: z.string().nullable(),
			tags: z.array(z.string()),
			favorite: z.boolean(),
		}),
	),
});

const buildBackupPayload = ({
	passwords,
	categories,
}: {
	passwords: {
		title: string;
		username?: string;
		password: string;
		url?: string;
		notes?: string;
		customFields?: z.infer<
			typeof backupPayloadSchema
		>["entries"][number]["customFields"];
		totp?: string;
		passwordHistory?: { password: string; changedAt: string }[];
		categoryId: string | null;
		tags: string[];
		favorite: boolean;
		deletedAt: string | null;
	}[];
	categories: { id: string; name: string; icon: string; color: string }[];
}) =>
	backupPayloadSchema.parse({
		categories: categories.map(({ name, icon, color }) => ({
			name,
			icon,
			color,
		})),
		entries: passwords
			.filter((entry) => !entry.deletedAt)
			.map((entry) => ({
				title: entry.title,
				username: entry.username,
				password: entry.password,
				url: entry.url,
				notes: entry.notes,
				customFields: entry.customFields,
				totp: entry.totp,
				passwordHistory: entry.passwordHistory,
				categoryName:
					categories.find(
						(category) => category.id === entry.categoryId,
					)?.name ?? null,
				tags: entry.tags,
				favorite: entry.favorite,
			})),
	});

const toBackupEnvelope = (
	sealed: Omit<z.infer<typeof backupEnvelopeSchema>, "format" | "version">,
) => ({ format: BACKUP_FORMAT, version: BACKUP_VERSION, ...sealed });

const parseJson = (text: string) => {
	try {
		const value: unknown = JSON.parse(text);

		return value;
	} catch {
		return null;
	}
};

const readBackupEnvelope = (text: string) => {
	const parsed = backupEnvelopeSchema.safeParse(parseJson(text));

	if (!parsed.success) {
		throw new Error("This is not a SecureVault backup file");
	}

	return parsed.data;
};

const readBackupPayload = (plaintext: string) =>
	backupPayloadSchema.parse(JSON.parse(plaintext));

const toBackupFileName = (now: number) =>
	`securevault-backup-${new Date(now).toISOString().slice(0, 10)}${BACKUP_FILE_EXTENSION}`;

export {
	BACKUP_FILE_EXTENSION,
	buildBackupPayload,
	readBackupEnvelope,
	readBackupPayload,
	toBackupEnvelope,
	toBackupFileName,
};
