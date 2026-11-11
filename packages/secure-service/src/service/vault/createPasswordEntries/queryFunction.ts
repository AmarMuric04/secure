import type { z } from "zod";

import type { entryMetadataSchema } from "../../../schemas";
import { requestApi } from "../../../client";
import { createdEntriesSchema } from "./schema";

const createPasswordEntries = (
	entries: {
		encryptedData: string;
		iv: string;
		metadata: z.infer<typeof entryMetadataSchema>;
	}[],
) =>
	requestApi({
		method: "POST",
		path: "/api/vault/passwords/bulk",
		body: { entries },
		schema: createdEntriesSchema,
	});

export { createPasswordEntries };
