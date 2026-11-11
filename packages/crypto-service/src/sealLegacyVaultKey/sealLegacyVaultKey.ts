import { sealVaultKey } from "../sealVaultKey";

const sealLegacyVaultKey = async ({
	wrappingKey,
	legacyKeyMaterial,
}: {
	wrappingKey: CryptoKey;
	legacyKeyMaterial: ArrayBuffer;
}) =>
	sealVaultKey({
		wrappingKey,
		extractableKey: await crypto.subtle.importKey(
			"raw",
			legacyKeyMaterial,
			{ name: "AES-GCM", length: 256 },
			true,
			["encrypt", "decrypt"],
		),
	});

export { sealLegacyVaultKey };
