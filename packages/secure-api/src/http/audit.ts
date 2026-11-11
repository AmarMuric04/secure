import type { Context } from "hono";

import { type AUDIT_ACTIONS, AuditLogModel } from "../db";
import { getClientIp, getUserAgent } from "./request";

const recordAudit = async ({
	context,
	userId,
	action,
	resourceType,
	resourceId,
	metadata,
}: {
	context: Context;
	userId: string;
	action: (typeof AUDIT_ACTIONS)[number];
	resourceType?: "password" | "category" | "user" | "session";
	resourceId?: string;
	metadata?: Record<string, unknown>;
}) => {
	await AuditLogModel.create({
		userId,
		action,
		resourceType,
		resourceId,
		metadata,
		ipAddress: getClientIp(context),
		userAgent: getUserAgent(context),
	}).catch((error: unknown) => {
		console.error("Audit log write failed", error);
	});
};

export { recordAudit };
