import { Schema } from "mongoose";

import { defineModel } from "../defineModel";

const settingsSchema = new Schema(
	{
		theme: {
			type: String,
			enum: ["light", "dark", "system"],
			default: "system",
		},
		language: { type: String, default: "en" },
		timezone: { type: String, default: "UTC" },
		autoLockMinutes: { type: Number, default: 15 },
		clearClipboardSeconds: { type: Number, default: 30 },
		showPasswordStrength: { type: Boolean, default: true },
		emailOnNewLogin: { type: Boolean, default: true },
		emailOnPasswordChange: { type: Boolean, default: true },
		emailSecurityAlerts: { type: Boolean, default: true },
		defaultView: { type: String, enum: ["grid", "list"], default: "grid" },
		defaultSort: {
			type: String,
			enum: ["name", "updated", "created"],
			default: "name",
		},
		showFavicons: { type: Boolean, default: false },
		passwordMaxAgeDays: { type: Number, default: 90 },
	},
	{ _id: false },
);

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		emailVerified: { type: Boolean, default: false },
		emailVerifiedAt: { type: Date },
		name: { type: String, trim: true },
		avatarUrl: { type: String },
		authProvider: { type: String, default: "credentials" },
		googleId: { type: String },
		authHash: { type: String },
		authSalt: { type: String },
		encryptedVaultKey: { type: String },
		keyVersion: { type: Number, default: 1 },
		mfaEnabled: { type: Boolean, default: false },
		mfaSecret: { type: String },
		mfaBackupCodes: { type: [String], default: [] },
		mfaLastUsedStep: { type: Number, default: 0 },
		settings: { type: settingsSchema, default: () => ({}) },
		lastLoginAt: { type: Date },
		lastActiveAt: { type: Date },
		status: {
			type: String,
			enum: ["active", "suspended", "deleted"],
			default: "active",
		},
	},
	{ timestamps: true },
);

userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ status: 1 });

const UserModel = defineModel({ name: "User", schema: userSchema });

export { UserModel };
