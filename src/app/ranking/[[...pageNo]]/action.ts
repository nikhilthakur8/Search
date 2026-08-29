import { searchIndex, type LeetcodeUserDoc } from "@/utils/meili";

type User = Pick<
	LeetcodeUserDoc,
	"username" | "realName" | "userAvatar" | "ranking" | "countryName"
>;

const LIMIT = 25;

// Meilisearch's sorted iteration stops being exact past ~300k documents deep on
// this index - verified correct at offset 300k, scrambled by 400k. Cap well
// inside that so every page we serve is genuinely in rank order.
const MAX_PAGES = 10_000;

async function handleGetRankingPage(pageNo: number) {
	const page = Math.min(Math.max(pageNo || 1, 1), MAX_PAGES);

	try {
		const index = searchIndex();
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
			totalPages: Math.min(
				Math.ceil(numberOfDocuments / LIMIT),
				MAX_PAGES
			),
		};
	} catch (error) {
		console.error("Error fetching ranking page:", error);
	}
}

export { handleGetRankingPage };
