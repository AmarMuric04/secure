import { sealVaultKey } from "../sealVaultKey";

const createVaultKey = async (wrappingKey: CryptoKey) =>
	sealVaultKey({
		wrappingKey,
		extractableKey: await crypto.subtle.generateKey(
			{ name: "AES-GCM", length: 256 },
			true,
			["encrypt", "decrypt"],
		),
	});

export { createVaultKey };
