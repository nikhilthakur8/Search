import User from "@/models/leetcodeData";

import connectDB from "@/utils/db";
type User = {
	_id: string;
	username: string;
	ranking: number;
	countryName?: string;
	userAvatar?: string;
};
async function handleGetRankingPage(pageNo: number) {
	const page = pageNo || 1;
	const limit = 25;
	const skip = (page - 1) * limit;
	try {
		await connectDB();
		const users = User.find({
			ranking: {
				$exists: true,
			},
		})
			.sort({ ranking: 1 })
			.skip(skip)
			.limit(limit);

		const totalUsers = User.countDocuments({
			ranking: { $exists: true },
		});

		const [usersResult, totalUsersResult]: [User[], number] =
			await Promise.all([users, totalUsers]);
		const totalPages = Math.ceil(totalUsersResult / limit);

		return { users: usersResult, totalPages };
	} catch (error) {
		console.error("Error fetching ranking page:", error);
	}
}

export { handleGetRankingPage };
