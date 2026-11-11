import type { z } from "zod";

import type { entryMetadataSchema } from "../../../schemas";
import { requestApi } from "../../../client";
import { passwordEntryResponseSchema } from "./schema";

const createPasswordEntry = (entry: {
	encryptedData: string;
	iv: string;
	metadata: z.infer<typeof entryMetadataSchema>;
}) =>
	requestApi({
		method: "POST",
		path: "/api/vault/passwords",
		body: entry,
		schema: passwordEntryResponseSchema,
	});

export { createPasswordEntry };
