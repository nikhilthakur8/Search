import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
	cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = mongoose
			.connect(process.env.MONGODB_URI!)
			.then((mongoose) => {
				return mongoose;
			})
			.catch((error) => {
				console.log("MongoDB connection error:", error);
				process.exit(1);
			});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}

export default connectDB;
