import { breachCatalogSchema } from "./schema";

const BREACH_CATALOG_URL = "https://haveibeenpwned.com/api/v3/breaches";

const getBreachCatalog = async () => {
	const response = await fetch(BREACH_CATALOG_URL, { credentials: "omit" });

	if (!response.ok) {
		throw new Error(
			`Breached sites list failed with status ${response.status}`,
		);
	}

	return breachCatalogSchema.parse(await response.json());
};

export { getBreachCatalog };
