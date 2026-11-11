import { requestApi } from "../../../client";
import { createdCategorySchema } from "./schema";

const createCategory = (category: {
	name: string;
	icon: string;
	color: string;
}) =>
	requestApi({
		method: "POST",
		path: "/api/vault/categories",
		body: category,
		schema: createdCategorySchema,
	});

export { createCategory };
