import { toHex } from "../encoding";

const hashSha1 = async (text: string) =>
	toHex(
		await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text)),
	).toUpperCase();

export { hashSha1 };
