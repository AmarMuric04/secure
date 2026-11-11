import mongoose, { type Schema } from "mongoose";

const defineModel = <ModelSchema extends Schema>({
	name,
	schema,
}: {
	name: string;
	schema: ModelSchema;
}) => {
	if (mongoose.models[name]) {
		mongoose.deleteModel(name);
	}

	return mongoose.model(name, schema);
};

export { defineModel };
