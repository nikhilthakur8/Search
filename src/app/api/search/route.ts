import {
	LEETCODE_INDEX,
	meiliSearchClient,
	type LeetcodeUserDoc,
} from "@/utils/meili";
import { NextRequest, NextResponse } from "next/server";

const SEARCH_FIELDS = ["username", "realName"];

type Hit = LeetcodeUserDoc & { _formatted?: Record<string, string> };

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q") || "";
	const page = parseInt(searchParams.get("page") || "1", 10);
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const offset = (page - 1) * limit;

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 }
		);
	}

	try {
		// "nikhil thakur" should also match the username "nikhilthakur"
		const compactQuery = query.replace(/\s+/g, "");
		const queries = [query, ...(compactQuery !== query ? [compactQuery] : [])];

		const { hits, estimatedTotalHits } = await meiliSearchClient.multiSearch({
			federation: { limit, offset },
			queries: queries.map((q) => ({
				indexUid: LEETCODE_INDEX,
				q,
				attributesToSearchOn: SEARCH_FIELDS,
				attributesToRetrieve: [
					"id",
					"username",
					"realName",
					"userAvatar",
					"ranking",
					"countryName",
				],
				attributesToHighlight: SEARCH_FIELDS,
				highlightPreTag: "<mark>",
				highlightPostTag: "</mark>",
			})),
		});

		const users = (hits as Hit[]).map((hit) => ({
			id: hit.id,
			username: hit.username,
			realName: hit.realName,
			userAvatar: hit.userAvatar,
			ranking: hit.ranking,
			countryName: hit.countryName,
			highlights: SEARCH_FIELDS.filter((f) => hit._formatted?.[f]).map(
				(path) => ({ path, texts: [{ value: hit._formatted![path] }] })
			),
		}));

		const total = estimatedTotalHits ?? users.length;

		return NextResponse.json(
			{
				users,
				pagination: {
					page,
					limit,
					total,
					hasMore: offset + users.length < total,
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
