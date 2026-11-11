const BACKUP_KDF = {
	name: "PBKDF2",
	hash: "SHA-256",
	iterations: 600_000,
} as const;

const deriveBackupKey = async ({
	password,
	salt,
	iterations,
}: {
	password: string;
	salt: Uint8Array<ArrayBuffer>;
	iterations: number;
}) => {
	const passwordKey = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);

	return crypto.subtle.deriveKey(
		{ name: "PBKDF2", hash: BACKUP_KDF.hash, salt, iterations },
		passwordKey,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
};

export { BACKUP_KDF, deriveBackupKey };
