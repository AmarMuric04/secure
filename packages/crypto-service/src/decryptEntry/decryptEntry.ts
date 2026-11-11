import { fromBase64 } from "../encoding";

const decryptEntry = async ({
	vaultKey,
	encryptedData,
	iv,
}: {
	vaultKey: CryptoKey;
	encryptedData: string;
	iv: string;
}) => {
	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: fromBase64(iv) },
		vaultKey,
		fromBase64(encryptedData),
	);
	const entry: unknown = JSON.parse(new TextDecoder().decode(plaintext));

	return entry;
};

export { decryptEntry };
