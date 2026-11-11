import { z } from "zod";

import { requestApi } from "../../../client";

const markPasswordUsed = (id: string) =>
	requestApi({
		method: "PATCH",
		path: `/api/vault/passwords/${encodeURIComponent(id)}/used`,
		schema: z.null(),
	});

export { markPasswordUsed };
