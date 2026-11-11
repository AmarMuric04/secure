import { z } from "zod";

const breachSchema = z.object({
	Title: z.string(),
	Domain: z.string(),
	BreachDate: z.string(),
	DataClasses: z.array(z.string()),
	IsSpamList: z.boolean().optional(),
	IsFabricated: z.boolean().optional(),
});

const breachCatalogSchema = z.array(z.unknown()).transform((breaches) =>
	breaches
		.map((breach) => breachSchema.safeParse(breach))
		.flatMap((result) => (result.success ? [result.data] : []))
		.filter(
			(breach) =>
				breach.Domain &&
				breach.DataClasses.includes("Passwords") &&
				!breach.IsSpamList &&
				!breach.IsFabricated,
		)
		.map((breach) => ({
			title: breach.Title,
			domain: breach.Domain.toLowerCase(),
			breachDate: breach.BreachDate,
		})),
);

export { breachCatalogSchema };
