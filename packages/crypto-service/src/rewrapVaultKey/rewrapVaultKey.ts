import { fromBase64 } from "../encoding";
import { sealVaultKey } from "../sealVaultKey";

const rewrapVaultKey = async ({
	currentWrappingKey,
	nextWrappingKey,
	encryptedVaultKey,
}: {
	currentWrappingKey: CryptoKey;
	nextWrappingKey: CryptoKey;
	encryptedVaultKey: string;
}) => {
	const [version, iv, wrappedKey] = encryptedVaultKey.split(".");

	if (version !== "v2" || !iv || !wrappedKey) {
		throw new Error("Unsupported vault key format");
	}

	const extractableKey = await crypto.subtle.unwrapKey(
		"raw",
		fromBase64(wrappedKey),
		currentWrappingKey,
		{ name: "AES-GCM", iv: fromBase64(iv) },
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

	return sealVaultKey({ wrappingKey: nextWrappingKey, extractableKey });
};

export { rewrapVaultKey };
