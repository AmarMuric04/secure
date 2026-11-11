import { requestApi } from "../../../client";
import { noContentSchema } from "../../../schemas";

const deleteCategory = ({ id, moveTo }: { id: string; moveTo?: string }) =>
	requestApi({
		method: "DELETE",
		path: `/api/vault/categories/${encodeURIComponent(id)}${moveTo ? `?moveTo=${encodeURIComponent(moveTo)}` : ""}`,
		schema: noContentSchema,
	});

export { deleteCategory };
