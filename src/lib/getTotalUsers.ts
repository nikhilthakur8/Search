import axios from "axios";
type Stats = {
	count: number;
	indexingRatePerHour: number;
	indexingRatePerSecond: number;
};
export const getTotalUsers = async (): Promise<Stats | null> => {
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats`
		);
		if (response.status === 200) {
			return response.data;
		}
		return null;
	} catch (error) {
		console.error("Failed to fetch total user count:", error);
		return null;
	}
};
