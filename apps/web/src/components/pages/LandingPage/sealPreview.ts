const createPreviewKey = () =>
	crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
		"encrypt",
	]);

const toBase64 = (bytes: Uint8Array) =>
	btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));

const sealPreview = async ({ key, text }: { key: CryptoKey; text: string }) => {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const sealed = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		new TextEncoder().encode(text),
	);

	return toBase64(new Uint8Array([...iv, ...new Uint8Array(sealed)]));
};

export { createPreviewKey, sealPreview };
