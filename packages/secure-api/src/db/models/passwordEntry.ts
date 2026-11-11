import { Schema } from "mongoose";

import { defineModel } from "../defineModel";

const passwordEntrySchema = new Schema(
	{
		userId: { type: String, required: true },
		encryptedData: { type: String, required: true },
		iv: { type: String, required: true },
		categoryId: { type: String },
		tags: { type: [String], default: [] },
		favorite: { type: Boolean, default: false },
		passwordStrength: { type: Number, enum: [0, 1, 2, 3, 4], default: 0 },
		isCompromised: { type: Boolean, default: false },
		isReused: { type: Boolean, default: false },
		lastUsedAt: { type: Date },
		passwordChangedAt: { type: Date, default: Date.now },
		deletedAt: { type: Date },
		encryptionVersion: { type: Number, default: 1 },
	},
	{ timestamps: true },
);

passwordEntrySchema.index({ userId: 1, deletedAt: 1 });
passwordEntrySchema.index({ userId: 1, categoryId: 1 });

const PasswordEntryModel = defineModel({
	name: "PasswordEntry",
	schema: passwordEntrySchema,
});

export { PasswordEntryModel };
