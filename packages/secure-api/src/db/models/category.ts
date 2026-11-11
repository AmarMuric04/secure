import { Schema } from "mongoose";

import { defineModel } from "../defineModel";

const categorySchema = new Schema(
	{
		userId: { type: String, required: true },
		name: { type: String, required: true, trim: true },
		icon: { type: String, default: "📁" },
		color: { type: String, default: "#6B7280" },
		parentId: { type: String },
		order: { type: Number, default: 0 },
		isDefault: { type: Boolean, default: false },
		isLocked: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

categorySchema.index({ userId: 1, order: 1 });

const CategoryModel = defineModel({ name: "Category", schema: categorySchema });

export { CategoryModel };
