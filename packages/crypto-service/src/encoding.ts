const toBase64 = (buffer: ArrayBuffer | Uint8Array) => {
	const bytes =
		buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
	let binary = "";

	for (const byte of bytes) {
		binary += String.fromCodePoint(byte);
	}

	return btoa(binary);
};

const fromBase64 = (encoded: string) =>
	Uint8Array.from(
		atob(encoded),
		(character) => character.codePointAt(0) ?? 0,
	);

const toHex = (buffer: ArrayBuffer | Uint8Array) =>
	Array.from(
		buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer),
		(byte) => byte.toString(16).padStart(2, "0"),
	).join("");

export { fromBase64, toBase64, toHex };
