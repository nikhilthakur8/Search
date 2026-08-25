import {
	fetchLeetcodeProfile,
	getIndexedUser,
	isStale,
	upsertIndexedUser,
} from "@/lib/leetcodeProfile";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { username } = await request.json();
		const trimmedUsername = username.trim();

		const indexed = await getIndexedUser(trimmedUsername);
		if (indexed && !isStale(indexed.updatedAt)) {
			return NextResponse.json(
				{
					message: "Profile data fetched successfully",
					profile: indexed,
				},
				{ status: 200 }
			);
		}

		const profile = await fetchLeetcodeProfile(trimmedUsername);
		if (!profile) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const document = await upsertIndexedUser(profile);

		return NextResponse.json(
			{
				message: "Profile data fetched and stored successfully",
				profile: document,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching profile data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile data" },
			{ status: 500 }
		);
	}
}
