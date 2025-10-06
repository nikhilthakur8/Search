import redis from "@/utils/redis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setCache = async (key: string, value: any, ttl = 300) => {
	await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const getCache = async (key: string) => {
	const data = await redis.get(key);
	return data ? JSON.parse(data) : null;
};

export const delCache = async (key: string) => {
	await redis.del(key);
};
