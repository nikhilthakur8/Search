import mongoose from "mongoose";

const users = new mongoose.Schema(
	{
		_id: String,
		username: String,
		password: String,
	},
	{ strict: false }
);
const User = mongoose.models.User || mongoose.model("User", users);
export default User;
