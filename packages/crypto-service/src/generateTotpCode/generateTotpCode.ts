import { decodeBase32 } from "../base32";

const toCounterBytes = (counter: number) => {
	const bytes = new Uint8Array(8);
	let remaining = counter;

	for (let index = 7; index >= 0; index -= 1) {
		bytes[index] = remaining % 256;
		remaining = Math.floor(remaining / 256);
	}

	return bytes;
};

const generateTotpCode = async ({
	secret,
	digits,
	period,
	algorithm,
	timestamp,
}: {
	secret: string;
	digits: number;
	period: number;
	algorithm: string;
	timestamp: number;
}) => {
	const keyBytes = decodeBase32(secret);

	if (!keyBytes) {
		throw new Error("Invalid 2FA secret");
	}

	const seconds = Math.floor(timestamp / 1_000);
	const key = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		{ name: "HMAC", hash: algorithm },
		false,
		["sign"],
	);
	const digest = new Uint8Array(
		await crypto.subtle.sign(
			"HMAC",
			key,
			toCounterBytes(Math.floor(seconds / period)),
		),
	);
	const offset = (digest.at(-1) ?? 0) & 0x0f;
	const binary =
		(((digest[offset] ?? 0) & 0x7f) << 24) |
		((digest[offset + 1] ?? 0) << 16) |
		((digest[offset + 2] ?? 0) << 8) |
		(digest[offset + 3] ?? 0);

	return {
		code: String(binary % 10 ** digits).padStart(digits, "0"),
		secondsRemaining: period - (seconds % period),
	};
};

export { generateTotpCode };
