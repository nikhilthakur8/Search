import { searchIndex, type LeetcodeUserDoc } from "@/utils/meili";

type User = Pick<
	LeetcodeUserDoc,
	"username" | "realName" | "userAvatar" | "ranking" | "countryName"
>;

async function handleGetRankingPage(pageNo: number) {
	const page = pageNo || 1;
	const limit = 25;

	try {
		const index = searchIndex();
		const { hits, totalHits } = await index.search("", {
			filter: "hasRanking = true",
			sort: ["ranking:asc"],
			attributesToRetrieve: [
				"username",
				"realName",
				"userAvatar",
				"ranking",
				"countryName",
			],
			hitsPerPage: limit,
			page,
		});

		return {
			users: hits as User[],
			totalPages: Math.ceil((totalHits ?? 0) / limit),
		};
	} catch (error) {
		console.error("Error fetching ranking page:", error);
	}
}

export { handleGetRankingPage };
