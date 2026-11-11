import { compare, hash } from "bcryptjs";

const HASH_ROUNDS = 12;
const UNMATCHABLE_HASH =
	"$2b$12$JLEMOlOnWIqSrY87TIwsYuELgu8lmIjqvD6xCEguZeFt58jsoGO4K";

const hashSecret = (secret: string) => hash(secret, HASH_ROUNDS);

const verifySecret = ({
	secret,
	secretHash,
}: {
	secret: string;
	secretHash: string | null | undefined;
}) => compare(secret, secretHash ?? UNMATCHABLE_HASH);

export { hashSecret, verifySecret };
