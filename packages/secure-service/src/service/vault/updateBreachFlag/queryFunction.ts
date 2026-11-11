import { z } from "zod";

import { requestApi } from "../../../client";

const updateBreachFlag = ({
	id,
	isCompromised,
}: {
	id: string;
	isCompromised: boolean;
}) =>
	requestApi({
		method: "PATCH",
		path: `/api/vault/passwords/${encodeURIComponent(id)}/breach`,
		body: { isCompromised },
		schema: z.null(),
	});

export { updateBreachFlag };
