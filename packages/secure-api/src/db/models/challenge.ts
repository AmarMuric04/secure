import { Schema } from "mongoose";

import { defineModel } from "../defineModel";

const pendingRegistrationSchema = new Schema({
	tokenHash: { type: String, required: true, unique: true },
	codeHash: { type: String, required: true },
	attempts: { type: Number, default: 0 },
	email: { type: String, required: true, lowercase: true, trim: true },
	name: { type: String },
	authHash: { type: String, required: true },
	salt: { type: String, required: true },
	encryptedVaultKey: { type: String, required: true },
	expiresAt: { type: Date, required: true },
});

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
pendingRegistrationSchema.index({ email: 1 });

const mfaChallengeSchema = new Schema({
	tokenHash: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	attempts: { type: Number, default: 0 },
	expiresAt: { type: Date, required: true },
});

mfaChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const rateLimitBucketSchema = new Schema({
	key: { type: String, required: true, unique: true },
	count: { type: Number, default: 0 },
	expiresAt: { type: Date, required: true },
});

rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingRegistrationModel = defineModel({
	name: "PendingRegistration",
	schema: pendingRegistrationSchema,
});
const MfaChallengeModel = defineModel({
	name: "MfaChallenge",
	schema: mfaChallengeSchema,
});
const RateLimitBucketModel = defineModel({
	name: "RateLimitBucket",
	schema: rateLimitBucketSchema,
});

export { MfaChallengeModel, PendingRegistrationModel, RateLimitBucketModel };
