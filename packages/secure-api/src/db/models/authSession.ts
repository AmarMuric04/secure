import { Schema } from "mongoose";

import { defineModel } from "../defineModel";

const authSessionSchema = new Schema(
	{
		userId: { type: String, required: true },
		tokenHash: { type: String, required: true, unique: true },
		userAgent: { type: String },
		ipAddress: { type: String },
		lastActiveAt: { type: Date, required: true },
		expiresAt: { type: Date, required: true },
		absoluteExpiresAt: { type: Date, required: true },
	},
	{ timestamps: true },
);

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authSessionSchema.index({ userId: 1 });

const AuthSessionModel = defineModel({
	name: "AuthSession",
	schema: authSessionSchema,
});

export { AuthSessionModel };
