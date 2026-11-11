import { requestApi } from "../../../client";
import { noContentSchema } from "../../../schemas";

const deletePasswordEntry = ({
	id,
	isPermanent,
}: {
	id: string;
	isPermanent: boolean;
}) =>
	requestApi({
		method: "DELETE",
		path: `/api/vault/passwords/${encodeURIComponent(id)}${isPermanent ? "?permanent=true" : ""}`,
		schema: noContentSchema,
	});

export { deletePasswordEntry };
