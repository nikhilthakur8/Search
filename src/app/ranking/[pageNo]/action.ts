import User from "@/models/leetcodeData";
import { getCache, setCache } from "@/lib/cache";
import connectDB from "@/utils/db";
type User = {
	_id: string;
	username: string;
	realName: string;
	userAvatar: string;
	ranking: number;
	countryName?: string;
};
async function handleGetRankingPage(pageNo: number) {
	const page = pageNo || 1;
	const limit = 25;
	const skip = (page - 1) * limit;
	try {
		const countCacheKey = `ranking:count`;
		let totalUsers = await getCache(countCacheKey);

		await connectDB();

		if (!totalUsers) {
			const totalUsersCount = await User.countDocuments({
				ranking: { $exists: true },
			});
			totalUsers = totalUsersCount;
			await setCache(countCacheKey, totalUsersCount, 3600);
		}

		const users = await User.find({
			ranking: {
				$exists: true,
			},
		})
			.sort({ ranking: 1 })
			.select("username realName userAvatar ranking countryName")
			.skip(skip)
			.limit(limit);

		const totalPages = Math.ceil(totalUsers / limit);

		return { users, totalPages };
	} catch (error) {
		console.error("Error fetching ranking page:", error);
	}
}

export { handleGetRankingPage };
