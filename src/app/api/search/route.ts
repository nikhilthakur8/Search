import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import { PipelineStage } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

function getSearchStage(query: string) {
	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const fields = ["username", "realName"];

	return {
		index: "default",
		compound: {
			should: [
				{
					text: {
						query,
						path: fields,
						score: { boost: { value: 10 } },
					},
				},
				{
					phrase: {
						query,
						path: fields,
						score: { boost: { value: 8 } },
					},
				},
				{
					wildcard: {
						query: `${query}*`,
						path: fields,
						score: { boost: { value: 7 } },
						allowAnalyzedField: true,
					},
				},
				{
					wildcard: {
						query: `*${query}`,
						path: fields,
						score: { boost: { value: 6 } },
						allowAnalyzedField: true,
					},
				},
				{
					wildcard: {
						query: `*${query}*`,
						path: fields,
						score: { boost: { value: 5 } },
						allowAnalyzedField: true,
					},
				},
				// {
				// 	regex: {
				// 		query: `.*${escapedQuery}.*`,
				// 		path: fields,
				// 		score: { boost: { value: 4 } },
				// 		allowAnalyzedField: true,
				// 	},
				// },
				// {
				// 	text: {
				// 		query,
				// 		path: fields,
				// 		fuzzy: { maxEdits: 1, prefixLength: 1 },
				// 		score: { boost: { value: 3 } },
				// 	},
				// },
			],
			minimumShouldMatch: 1,
		},
	};
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q") || "";
	const page = parseInt(searchParams.get("page") || "1", 10);
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	console.log({ limit });
	const skip = (page - 1) * limit;

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 }
		);
	}

	try {
		await connectDB();

		// Build search pipeline
		const searchStage = getSearchStage(query);
		const pipeline: PipelineStage[] = [{ $search: searchStage }];
		const countPipeline: PipelineStage[] = [...pipeline];

		// Pagination
		pipeline.push({ $skip: skip }, { $limit: limit });

		// Add search metadata
		pipeline.push({
			$addFields: {
				score: { $meta: "searchScore" },
				highlights: { $meta: "searchHighlights" },
			},
		});
		pipeline.push({ $sort: { score: -1 } });

		// Execute aggregation
		const results = await User.aggregate(pipeline);
		countPipeline.push({ $count: "total" });
		const count = await User.aggregate(countPipeline);
		const hasMore = skip + results.length < (count[0]?.total || 0);
		return NextResponse.json(
			{
				users: results,
				pagination: {
					page,
					limit,
					total: count[0]?.total || 0,
					hasMore,
				},
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
