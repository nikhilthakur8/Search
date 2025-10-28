import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await connectDB();
		const count = await User.estimatedDocumentCount();
		const indexingRatePerHour = await User.find({
			$and: [
				{
					createdAt: {
						$gte: new Date(Date.now() - 60 * 60 * 1000),
					},
				},
				{
					createdAt: {
						$lte: new Date(),
					},
				},
			],
		}).countDocuments();
		const indexingRatePerSecond = indexingRatePerHour / 3600;

		return NextResponse.json(
			{ count, indexingRatePerHour, indexingRatePerSecond },
			{
				status: 200,
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
