const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const normalizeBase32 = (value: string) =>
	value.replaceAll(/[\s-]/g, "").replace(/=+$/, "").toUpperCase();

const decodeBase32 = (value: string) => {
	const normalized = normalizeBase32(value);
	const bytes: number[] = [];
	let buffer = 0;
	let bitCount = 0;

	for (const character of normalized) {
		const index = BASE32_ALPHABET.indexOf(character);

		if (index === -1) {
			return null;
		}

		buffer = (buffer << 5) | index;
		bitCount += 5;

		if (bitCount >= 8) {
			bitCount -= 8;
			bytes.push((buffer >> bitCount) & 0xff);
		}
	}

	return new Uint8Array(bytes);
};

export { decodeBase32, normalizeBase32 };
