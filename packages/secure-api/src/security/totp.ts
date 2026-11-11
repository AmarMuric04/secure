import { createHmac, randomBytes } from "node:crypto";

import { isEqualSecret } from "./tokens";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const CODE_DIGITS = 6;
const DRIFT_STEPS = 1;
const ISSUER = "SecureVault";

const encodeBase32 = (bytes: Uint8Array) => {
	let output = "";
	let bitCount = 0;
	let buffer = 0;

	for (const byte of bytes) {
		buffer = (buffer << 8) | byte;
		bitCount += 8;

		while (bitCount >= 5) {
			bitCount -= 5;
			output += BASE32_ALPHABET[(buffer >>> bitCount) & 31];
		}
	}

	if (bitCount > 0) {
		output += BASE32_ALPHABET[(buffer << (5 - bitCount)) & 31];
	}

	return output;
};

const decodeBase32 = (encoded: string) => {
	const bytes: number[] = [];
	let bitCount = 0;
	let buffer = 0;

	for (const character of encoded
		.toUpperCase()
		.replaceAll(/[^A-Z2-7]/g, "")) {
		buffer = (buffer << 5) | BASE32_ALPHABET.indexOf(character);
		bitCount += 5;

		if (bitCount >= 8) {
			bitCount -= 8;
			bytes.push((buffer >>> bitCount) & 255);
		}
	}

	return Buffer.from(bytes);
};

const codeForStep = ({ secret, step }: { secret: string; step: number }) => {
	const counter = Buffer.alloc(8);
	counter.writeBigUInt64BE(BigInt(step));

	const digest = createHmac("sha1", decodeBase32(secret))
		.update(counter)
		.digest();
	const offset = (digest.at(-1) ?? 0) & 15;
	const binary = digest.readUInt32BE(offset) & 0x7f_ff_ff_ff;

	return (binary % 10 ** CODE_DIGITS).toString().padStart(CODE_DIGITS, "0");
};

const createTotpSecret = () => encodeBase32(randomBytes(20));

const isValidTotpSecret = (secret: string) => /^[A-Z2-7]{32}$/.test(secret);

const findTotpStep = ({
	secret,
	code,
	lastUsedStep,
}: {
	secret: string;
	code: string;
	lastUsedStep: number;
}) => {
	const currentStep = Math.floor(Date.now() / 1_000 / STEP_SECONDS);

	for (let drift = -DRIFT_STEPS; drift <= DRIFT_STEPS; drift += 1) {
		const step = currentStep + drift;

		if (
			step > lastUsedStep &&
			isEqualSecret({ left: codeForStep({ secret, step }), right: code })
		) {
			return step;
		}
	}

	return null;
};

const createOtpauthUrl = ({
	secret,
	email,
}: {
	secret: string;
	email: string;
}) => {
	const label = encodeURIComponent(`${ISSUER}:${email}`);
	const parameters = new URLSearchParams({
		secret,
		issuer: ISSUER,
		algorithm: "SHA1",
		digits: String(CODE_DIGITS),
		period: String(STEP_SECONDS),
	});

	return `otpauth://totp/${label}?${parameters.toString()}`;
};

export { createOtpauthUrl, createTotpSecret, findTotpStep, isValidTotpSecret };
