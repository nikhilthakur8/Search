import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	await connectDB();
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q") || "";
	console.log("Search query:", query);
	if (!query) {
		return NextResponse.json(
			{ message: "Query parameter is required" },
			{ status: 400 }
		);
	}
	try {
		const pipeline = [
			{
				$search: {
					index: "default",
					regex: {
						query: `.*${query}.*`, // what you want to match
						path: "username", // field to search on
						allowAnalyzedField: true,
					},
				},
			},
			{ $sort: { username: 1 } }, // sort before skip/limit (better performance)
			{ $skip: 0 },
			{ $limit: 20 },
			{
				$project: {
					_id: 1,
					username: 1,
					realName: 1,
				},
			},
		];

		const users = await User.aggregate(pipeline);
		return NextResponse.json({ users }, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
