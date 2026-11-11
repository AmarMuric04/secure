import { pwnedRangeSchema } from "./schema";

const PWNED_RANGE_URL = "https://api.pwnedpasswords.com/range/";

const getPwnedRange = async (prefix: string) => {
	const response = await fetch(
		`${PWNED_RANGE_URL}${encodeURIComponent(prefix)}`,
		{ headers: { "Add-Padding": "true" }, credentials: "omit" },
	);

	if (!response.ok) {
		throw new Error(`Breach check failed with status ${response.status}`);
	}

	return pwnedRangeSchema.parse(await response.text());
};

export { getPwnedRange };
