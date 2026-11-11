import { decodeBase32, normalizeBase32 } from "../base32";

const ALGORITHMS = { SHA1: "SHA-1", SHA256: "SHA-256", SHA512: "SHA-512" };
const MIN_SECRET_BYTES = 10;

const toAlgorithm = (value: string | null) => {
	const key = (value ?? "SHA1").toUpperCase();

	return key in ALGORITHMS
		? ALGORITHMS[key as keyof typeof ALGORITHMS]
		: null;
};

const readTotpUri = (input: string) => {
	try {
		const uri = new URL(input);

		if (uri.protocol !== "otpauth:" || uri.hostname !== "totp") {
			return null;
		}

		const label = decodeURIComponent(uri.pathname.replace(/^\//, ""));

		return {
			secret: uri.searchParams.get("secret") ?? "",
			digits: Number(uri.searchParams.get("digits") ?? 6),
			period: Number(uri.searchParams.get("period") ?? 30),
			algorithm: toAlgorithm(uri.searchParams.get("algorithm")),
			issuer:
				uri.searchParams.get("issuer") ??
				(label.includes(":") ? (label.split(":")[0] ?? null) : null),
		};
	} catch {
		return null;
	}
};

const parseTotpSecret = (input: string) => {
	const trimmed = input.trim();
	const parsed = trimmed.toLowerCase().startsWith("otpauth://")
		? readTotpUri(trimmed)
		: {
				secret: trimmed,
				digits: 6,
				period: 30,
				algorithm: "SHA-1",
				issuer: null,
			};

	if (!parsed?.algorithm) {
		return null;
	}

	const key = decodeBase32(parsed.secret);
	const isValid =
		!!key &&
		key.length >= MIN_SECRET_BYTES &&
		[6, 7, 8].includes(parsed.digits) &&
		Number.isInteger(parsed.period) &&
		parsed.period > 0;

	if (!isValid) {
		return null;
	}

	return {
		secret: normalizeBase32(parsed.secret),
		digits: parsed.digits,
		period: parsed.period,
		algorithm: parsed.algorithm,
		issuer: parsed.issuer,
	};
};

export { parseTotpSecret };
