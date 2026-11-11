import { hashSha1 } from "crypto-service";

const PREFIX_LENGTH = 5;

const scanForBreaches = async ({
	passwords,
	fetchRange,
}: {
	passwords: { id: string; password: string }[];
	fetchRange: (prefix: string) => Promise<Record<string, number>>;
}) => {
	const hashed = await Promise.all(
		passwords
			.filter((entry) => entry.password)
			.map(async (entry) => ({
				id: entry.id,
				hash: await hashSha1(entry.password),
			})),
	);
	const prefixes = hashed
		.map((entry) => entry.hash.slice(0, PREFIX_LENGTH))
		.filter((prefix, index, all) => all.indexOf(prefix) === index);
	const ranges = Object.fromEntries(
		await Promise.all(
			prefixes.map(
				async (prefix) => [prefix, await fetchRange(prefix)] as const,
			),
		),
	);

	return Object.fromEntries(
		hashed.map((entry) => [
			entry.id,
			ranges[entry.hash.slice(0, PREFIX_LENGTH)]?.[
				entry.hash.slice(PREFIX_LENGTH)
			] ?? 0,
		]),
	);
};

const readBreachFlagChanges = ({
	passwords,
	breachCounts,
}: {
	passwords: { id: string; isCompromised: boolean }[];
	breachCounts: Record<string, number>;
}) =>
	passwords
		.filter((entry) => entry.id in breachCounts)
		.map((entry) => ({
			id: entry.id,
			isCompromised: (breachCounts[entry.id] ?? 0) > 0,
		}))
		.filter(
			(change) =>
				change.isCompromised !==
				passwords.find((entry) => entry.id === change.id)
					?.isCompromised,
		);

export { readBreachFlagChanges, scanForBreaches };
