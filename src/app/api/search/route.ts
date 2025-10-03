import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import { PipelineStage } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

function getSearchStage(query: string) {
	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const fields = ["username", "realName"];
	const compactQuery = query.replace(/\s+/g, "");

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
					text: {
						query: compactQuery,
						path: fields,
						score: { boost: { value: 9 } },
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

				// {
				// 	wildcard: {
				// 		query: `*${query}`,
				// 		path: fields,
				// 		score: { boost: { value: 6 } },
				// 		allowAnalyzedField: true,
				// 	},
				// },
				// {
				// 	wildcard: {
				// 		query: `*${query}*`,
				// 		path: fields,
				// 		score: { boost: { value: 5 } },
				// 		allowAnalyzedField: true,
				// 	},
				// },
				// {
				// 	regex: {
				// 		query: `.*${escapedQuery}.*`,
				// 		path: fields,
				// 		score: { boost: { value: 4 } },
				// 		allowAnalyzedField: true,
				// 	},
				// },
				{
					text: {
						query,
						path: fields,
						fuzzy: { maxEdits: 1, prefixLength: 1 },
						score: { boost: { value: 5 } },
					},
				},
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
	const skip = (page - 1) * limit;

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 }
		);
	}

	try {
		await connectDB();

		const pipeline: PipelineStage[] = [
			{ $search: getSearchStage(query) },
			{
				$addFields: {
					score: { $meta: "searchScore" },
					highlights: { $meta: "searchHighlights" },
				},
			},
			{
				$facet: {
					results: [
						{ $sort: { score: -1 } },
						{ $skip: skip },
						{ $limit: limit },
						{
							$project: {
								username: 1,
								realName: 1,
								userAvatar: 1,
								score: 1,
								highlights: 1,
							},
						},
					],
					totalCount: [{ $count: "total" }],
				},
			},
		];

		const aggResult = await User.aggregate(pipeline);
		const resultsData = aggResult[0]?.results || [];
		const totalCount = aggResult[0]?.totalCount[0]?.total || 0;
		const hasMore = skip + resultsData.length < totalCount;

		return NextResponse.json(
			{
				users: resultsData,
				pagination: { page, limit, total: totalCount, hasMore },
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
