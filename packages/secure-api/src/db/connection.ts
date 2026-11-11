import mongoose from "mongoose";

import { getEnv } from "../env";

let connection: Promise<typeof mongoose> | undefined;

const connectDatabase = async () => {
	connection ??= mongoose
		.connect(getEnv().MONGODB_URI, {
			bufferCommands: false,
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5_000,
			socketTimeoutMS: 45_000,
		})
		.catch((error: unknown) => {
			connection = undefined;
			throw error;
		});

	return connection;
};

export { connectDatabase };
