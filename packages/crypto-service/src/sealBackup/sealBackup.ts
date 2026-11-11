import { BACKUP_KDF, deriveBackupKey } from "../deriveBackupKey";
import { toBase64 } from "../encoding";

const SALT_BYTES = 16;
const IV_BYTES = 12;

const sealBackup = async ({
	password,
	plaintext,
}: {
	password: string;
	plaintext: string;
}) => {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
	const key = await deriveBackupKey({
		password,
		salt,
		iterations: BACKUP_KDF.iterations,
	});
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		new TextEncoder().encode(plaintext),
	);

	return {
		kdf: BACKUP_KDF,
		salt: toBase64(salt),
		iv: toBase64(iv),
		ciphertext: toBase64(ciphertext),
	};
};

export { sealBackup };
