import type { z } from "zod";

import type { entryMetadataSchema } from "../../../schemas";
import { requestApi } from "../../../client";
import { updatedEntrySchema } from "./schema";

const updatePasswordEntry = ({
	id,
	...entry
}: {
	id: string;
	encryptedData: string;
	iv: string;
	metadata: z.infer<typeof entryMetadataSchema>;
	isPasswordChanged: boolean;
}) =>
	requestApi({
		method: "PUT",
		path: `/api/vault/passwords/${encodeURIComponent(id)}`,
		body: entry,
		schema: updatedEntrySchema,
	});

export { updatePasswordEntry };
