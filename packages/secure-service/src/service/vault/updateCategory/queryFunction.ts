import { requestApi } from "../../../client";
import { updatedCategorySchema } from "./schema";

const updateCategory = ({
	id,
	...changes
}: {
	id: string;
	name?: string;
	icon?: string;
	color?: string;
	order?: number;
}) =>
	requestApi({
		method: "PUT",
		path: `/api/vault/categories/${encodeURIComponent(id)}`,
		body: changes,
		schema: updatedCategorySchema,
	});

export { updateCategory };
