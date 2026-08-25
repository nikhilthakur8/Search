import { Meilisearch } from "meilisearch";

export const LEETCODE_INDEX = process.env.MEILI_INDEX ?? "leetcode_users";

const host = process.env.MEILI_HOST!;

export const meiliSearchClient = new Meilisearch({
	host,
	apiKey: process.env.MEILI_SEARCH_KEY!,
});

export const meiliWriteClient = new Meilisearch({
	host,
	apiKey: process.env.MEILI_WRITE_KEY ?? process.env.MEILI_SEARCH_KEY!,
});

export const searchIndex = () => meiliSearchClient.index(LEETCODE_INDEX);
export const writeIndex = () => meiliWriteClient.index(LEETCODE_INDEX);

export type LeetcodeUserDoc = {
	id: string;
	username: string;
	realName?: string;
	userAvatar?: string;
	ranking?: number;
	countryName?: string;
	company?: string;
	school?: string;
	jobTitle?: string;
	aboutMe?: string;
	githubUrl?: string;
	twitterUrl?: string;
	linkedinUrl?: string;
	websites?: string[];
	hasRanking?: boolean;
	createdAt?: string;
	createdAtTs?: number;
	updatedAt?: string;
};

// Meilisearch primary keys only accept [a-zA-Z0-9-_]
export const toDocumentId = (username: string, fallback?: string) => {
	const sanitized = username.replace(/[^a-zA-Z0-9-_]/g, "_");
	return sanitized.length ? sanitized : (fallback ?? username);
};
