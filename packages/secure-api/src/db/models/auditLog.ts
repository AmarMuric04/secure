import { Schema } from "mongoose";

import { defineModel } from "../defineModel";

const AUDIT_ACTIONS = [
	"login",
	"logout",
	"login_failed",
	"mfa_enabled",
	"mfa_disabled",
	"password_created",
	"password_updated",
	"password_deleted",
	"password_restored",
	"category_deleted",
	"settings_changed",
	"vault_key_created",
	"vault_key_upgraded",
	"master_password_changed",
	"session_revoked",
	"account_deleted",
] as const;

const auditLogSchema = new Schema(
	{
		userId: { type: String, required: true },
		action: { type: String, required: true, enum: AUDIT_ACTIONS },
		resourceType: {
			type: String,
			enum: ["password", "category", "user", "session"],
		},
		resourceId: { type: String },
		ipAddress: { type: String },
		userAgent: { type: String },
		metadata: { type: Schema.Types.Mixed, default: {} },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63_072_000 });

const AuditLogModel = defineModel({ name: "AuditLog", schema: auditLogSchema });

export { AUDIT_ACTIONS, AuditLogModel };
