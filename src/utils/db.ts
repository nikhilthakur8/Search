import mongoose, { Mongoose } from "mongoose";

interface MongooseCache {
	conn: Mongoose | null;
	promise: Promise<Mongoose> | null;
}

// Extend the NodeJS global type
declare global {
	var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? {
	conn: null,
	promise: null,
};

global.mongoose = cached;

async function connectDB(): Promise<Mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = mongoose
			.connect(process.env.MONGODB_URI!)
			.then((mongooseInstance) => mongooseInstance)
			.catch((error) => {
				console.error("MongoDB connection error:", error);
				process.exit(1);
			});
	}

	cached.conn = await cached.promise;
	return cached.conn;
}

export default connectDB;
