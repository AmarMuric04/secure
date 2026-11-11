import { fromBase64 } from "../encoding";

const unlockVaultKey = async ({
	wrappingKey,
	encryptedVaultKey,
}: {
	wrappingKey: CryptoKey;
	encryptedVaultKey: string;
}) => {
	const [version, iv, wrappedKey] = encryptedVaultKey.split(".");

	if (version !== "v2" || !iv || !wrappedKey) {
		throw new Error("Unsupported vault key format");
	}

	return crypto.subtle.unwrapKey(
		"raw",
		fromBase64(wrappedKey),
		wrappingKey,
		{ name: "AES-GCM", iv: fromBase64(iv) },
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
};

export { unlockVaultKey };
