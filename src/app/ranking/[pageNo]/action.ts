import User from "@/models/leetcodeData";

import connectDB from "@/utils/db";

async function handleGetRankingPage(pageNo: number) {
	const page = pageNo || 1;
	const limit = 25;
	const skip = (page - 1) * limit;
	try {
		await connectDB();
		const users = await User.find({
			ranking: {
				$exists: true,
			},
		})
			.sort({ ranking: 1 })
			.skip(skip)
			.limit(limit);

		const totalUsers = await User.countDocuments({
			ranking: { $exists: true },
		});
		const totalPages = Math.ceil(totalUsers / limit);
		return { users, totalPages };
	} catch (error) {
		console.error("Error fetching ranking page:", error);
	}
}

export { handleGetRankingPage };
