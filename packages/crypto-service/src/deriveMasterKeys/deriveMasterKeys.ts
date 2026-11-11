import { toHex } from "../encoding";

const PBKDF2_ITERATIONS = 600_000;
const KEY_BITS = 256;
const WRAPPING_KEY_INFO = "secure-vault:vault-key-wrap:v2";

const deriveMasterKeys = async ({
	password,
	salt,
}: {
	password: string;
	salt: string;
}) => {
	const encoder = new TextEncoder();
	const passwordKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const deriveBitsFor = async (purpose: "auth" | "enc") =>
		crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				salt: await crypto.subtle.digest(
					"SHA-256",
					encoder.encode(`${salt}:${purpose}`),
				),
				iterations: PBKDF2_ITERATIONS,
				hash: "SHA-256",
			},
			passwordKey,
			KEY_BITS,
		);
	const [authBits, legacyKeyMaterial] = await Promise.all([
		deriveBitsFor("auth"),
		deriveBitsFor("enc"),
	]);
	const authKey = await crypto.subtle.importKey(
		"raw",
		authBits,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const stretchedKey = await crypto.subtle.importKey(
		"raw",
		legacyKeyMaterial,
		"HKDF",
		false,
		["deriveKey"],
	);
	const wrappingKey = await crypto.subtle.deriveKey(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: new Uint8Array(32),
			info: encoder.encode(WRAPPING_KEY_INFO),
		},
		stretchedKey,
		{ name: "AES-GCM", length: KEY_BITS },
		false,
		["wrapKey", "unwrapKey"],
	);
	const authHash = toHex(
		await crypto.subtle.sign("HMAC", authKey, encoder.encode(salt)),
	);

	return { authHash, wrappingKey, legacyKeyMaterial };
};

export { deriveMasterKeys };
