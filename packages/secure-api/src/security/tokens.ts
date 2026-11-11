import {
	createHash,
	createHmac,
	randomBytes,
	randomInt,
	timingSafeEqual,
} from "node:crypto";

import { getEnv } from "../env";

const createToken = (byteLength = 32) =>
	randomBytes(byteLength).toString("base64url");

const createNumericCode = (digits: number) =>
	randomInt(0, 10 ** digits)
		.toString()
		.padStart(digits, "0");

const createHexCode = (byteLength: number) =>
	randomBytes(byteLength).toString("hex").toUpperCase();

const hashToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

const signValue = (value: string) =>
	createHmac("sha256", getEnv().SERVER_SECRET).update(value).digest("hex");

const isEqualSecret = ({ left, right }: { left: string; right: string }) => {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);

	if (leftBuffer.length !== rightBuffer.length) {
		return false;
	}

	return timingSafeEqual(leftBuffer, rightBuffer);
};

export {
	createHexCode,
	createNumericCode,
	createToken,
	hashToken,
	isEqualSecret,
	signValue,
};
