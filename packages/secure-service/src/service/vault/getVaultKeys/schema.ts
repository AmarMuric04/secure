import { z } from "zod";

const vaultKeysSchema = z.object({
	salt: z.string().nullable(),
	encryptedVaultKey: z.string().nullable(),
	keyVersion: z.union([z.literal(1), z.literal(2)]),
});

export { vaultKeysSchema };
