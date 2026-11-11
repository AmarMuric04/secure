import { toBase64 } from "./encoding";
import { unlockVaultKey } from "./unlockVaultKey/unlockVaultKey";

const sealVaultKey = async ({
	wrappingKey,
	extractableKey,
}: {
	wrappingKey: CryptoKey;
	extractableKey: CryptoKey;
}) => {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const wrappedKey = await crypto.subtle.wrapKey(
		"raw",
		extractableKey,
		wrappingKey,
		{ name: "AES-GCM", iv },
	);
	const encryptedVaultKey = `v2.${toBase64(iv)}.${toBase64(wrappedKey)}`;
	const vaultKey = await unlockVaultKey({ wrappingKey, encryptedVaultKey });

	return { vaultKey, encryptedVaultKey };
};

export { sealVaultKey };
