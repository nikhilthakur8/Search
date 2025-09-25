import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await connectDB();
		const count = await User.countDocuments();
		return NextResponse.json(
			{ count },
			{
				status: 200,
				headers: {
					"Cache-Control":
						"public, s-maxage=86400, stale-while-revalidate=3600",
				},
			}
		);
	} catch (error: unknown) {
		console.log(error);
		return NextResponse.json(
			{
				error: "Internal Server Error",
				details: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
