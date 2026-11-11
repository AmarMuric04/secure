import { requestApi } from "../../../client";
import { restoredEntrySchema } from "./schema";

const restorePasswordEntry = (id: string) =>
	requestApi({
		method: "POST",
		path: `/api/vault/passwords/${encodeURIComponent(id)}/restore`,
		schema: restoredEntrySchema,
	});

export { restorePasswordEntry };
