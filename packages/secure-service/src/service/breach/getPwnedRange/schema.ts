import { z } from "zod";

const SUFFIX_LENGTH = 35;

const pwnedRangeSchema = z.string().transform((body) =>
	Object.fromEntries(
		body
			.split(/\r?\n/)
			.map((line) => line.trim().split(":"))
			.map(
				([suffix = "", count = "0"]) =>
					[suffix, Number(count)] as const,
			)
			.filter(
				([suffix, count]) =>
					suffix.length === SUFFIX_LENGTH && count > 0,
			),
	),
);

export { pwnedRangeSchema };
