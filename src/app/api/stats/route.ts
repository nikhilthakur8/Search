import { searchIndex } from "@/utils/meili";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const index = searchIndex();
		const { numberOfDocuments } = await index.getStats();

		const oneHourAgo = Date.now() - 60 * 60 * 1000;
		const { totalHits } = await index.search("", {
			filter: `createdAtTs > ${oneHourAgo}`,
			hitsPerPage: 0,
			page: 1,
		});

		const indexingRatePerHour = totalHits ?? 0;

		return NextResponse.json(
			{
				count: numberOfDocuments,
				indexingRatePerHour,
				indexingRatePerSecond: indexingRatePerHour / 3600,
			},
			{ status: 200 }
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
