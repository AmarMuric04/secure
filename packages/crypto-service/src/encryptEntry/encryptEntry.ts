import { toBase64 } from "../encoding";

const encryptEntry = async ({
	vaultKey,
	entry,
}: {
	vaultKey: CryptoKey;
	entry: unknown;
}) => {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		vaultKey,
		new TextEncoder().encode(JSON.stringify(entry)),
	);

	return { encryptedData: toBase64(ciphertext), iv: toBase64(iv) };
};

export { encryptEntry };
