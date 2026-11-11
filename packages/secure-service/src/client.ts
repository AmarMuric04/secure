import { z } from "zod";

const errorBodySchema = z.object({
	error: z.object({ code: z.string(), message: z.string() }),
});

const requestApi = async <Schema extends z.ZodType>({
	method = "GET",
	path,
	body,
	schema,
}: {
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	path: string;
	body?: unknown;
	schema: Schema;
}) => {
	const response = await fetch(path, {
		method,
		credentials: "same-origin",
		headers: {
			"x-secure-client": "web",
			...(body === undefined
				? {}
				: { "Content-Type": "application/json" }),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const payload: unknown =
		response.status === 204
			? null
			: await response.json().catch(() => null);

	if (!response.ok) {
		const parsedError = errorBodySchema.safeParse(payload);

		throw new Error(
			parsedError.success
				? parsedError.data.error.message
				: `Request failed with status ${response.status}`,
			{
				cause: {
					status: response.status,
					code: parsedError.success
						? parsedError.data.error.code
						: "UNKNOWN",
				},
			},
		);
	}

	return schema.parse(payload);
};

const readErrorCause = (error: unknown) => {
	const cause = z
		.object({ status: z.number(), code: z.string() })
		.safeParse(error instanceof Error ? error.cause : undefined);

	return cause.success ? cause.data : null;
};

export { readErrorCause, requestApi };
