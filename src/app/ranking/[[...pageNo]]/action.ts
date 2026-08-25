import { searchIndex, type LeetcodeUserDoc } from "@/utils/meili";

type User = Pick<
	LeetcodeUserDoc,
	"username" | "realName" | "userAvatar" | "ranking" | "countryName"
>;

const LIMIT = 25;

async function handleGetRankingPage(pageNo: number) {
	const page = pageNo || 1;

	try {
		const index = searchIndex();

		// limit/offset skips the exact-count pass that hitsPerPage/page forces,
		// which is what made deep pages expensive. Total comes from index stats.
		const [{ hits }, { numberOfDocuments }] = await Promise.all([
			index.search("", {
				filter: "hasRanking = true",
				sort: ["ranking:asc"],
				attributesToRetrieve: [
					"username",
					"realName",
					"userAvatar",
					"ranking",
					"countryName",
				],
				offset: (page - 1) * LIMIT,
				limit: LIMIT,
			}),
			index.getStats(),
		]);

		return {
			users: hits as User[],
			totalPages: Math.ceil(numberOfDocuments / LIMIT),
		};
	} catch (error) {
		console.error("Error fetching ranking page:", error);
	}
}

export { handleGetRankingPage };
