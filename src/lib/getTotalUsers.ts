import axios from "axios";

export const getTotalUsers = async (): Promise<number | null> => {
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/count`
		);
		if (response.status === 200) {
			return response.data.count;
		}
		return null;
	} catch (error) {
		console.error("Failed to fetch total user count:", error);
		return null;
	}
};
