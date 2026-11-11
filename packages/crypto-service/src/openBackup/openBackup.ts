import { deriveBackupKey } from "../deriveBackupKey";
import { fromBase64 } from "../encoding";

const openBackup = async ({
	password,
	iterations,
	salt,
	iv,
	ciphertext,
}: {
	password: string;
	iterations: number;
	salt: string;
	iv: string;
	ciphertext: string;
}) => {
	const key = await deriveBackupKey({
		password,
		salt: fromBase64(salt),
		iterations,
	});
	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: fromBase64(iv) },
		key,
		fromBase64(ciphertext),
	);

	return new TextDecoder().decode(plaintext);
};

export { openBackup };
