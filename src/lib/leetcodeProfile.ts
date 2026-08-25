import axios from "axios";
import {
	toDocumentId,
	writeIndex,
	searchIndex,
	type LeetcodeUserDoc,
} from "@/utils/meili";

const PROFILE_QUERY = `
    query userPublicProfile($username: String!) {
  matchedUser(username: $username) {
    username
    githubUrl
    twitterUrl
    linkedinUrl
    profile {
      ranking
      userAvatar
      realName
      aboutMe
      school
      websites
      countryName
      company
      jobTitle
    }
  }
}
    `;

export async function fetchLeetcodeProfile(username: string) {
	const response = await axios.post("https://leetcode.com/graphql/", {
		query: PROFILE_QUERY,
		variables: { username },
	});

	const matchedUser = response.data?.data?.matchedUser;
	if (!matchedUser) return null;

	return {
		username: matchedUser.username,
		githubUrl: matchedUser.githubUrl,
		twitterUrl: matchedUser.twitterUrl,
		linkedinUrl: matchedUser.linkedinUrl,
		...matchedUser.profile,
	} as Omit<LeetcodeUserDoc, "id">;
}

export async function getIndexedUser(
	username: string
): Promise<LeetcodeUserDoc | null> {
	try {
		return await searchIndex().getDocument<LeetcodeUserDoc>(
			toDocumentId(username)
		);
	} catch {
		return null;
	}
}

export async function upsertIndexedUser(profile: Omit<LeetcodeUserDoc, "id">) {
	const now = new Date().toISOString();
	const existing = await getIndexedUser(profile.username);

	const document: LeetcodeUserDoc = {
		...profile,
		id: toDocumentId(profile.username),
		hasRanking: typeof profile.ranking === "number" && profile.ranking > 0,
		createdAt: existing?.createdAt ?? now,
		createdAtTs: existing?.createdAtTs ?? Date.now(),
		updatedAt: now,
	};

	await writeIndex().addDocuments([document]);
	return document;
}

export const isStale = (updatedAt?: string) =>
	!updatedAt ||
	Date.now() - new Date(updatedAt).getTime() > 30 * 24 * 60 * 60 * 1000;
