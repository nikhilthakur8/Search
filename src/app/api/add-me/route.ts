import { fetchLeetcodeProfile, upsertIndexedUser } from "@/lib/leetcodeProfile";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { username } = await request.json();
		const trimmedUsername = username.trim();

		const profile = await fetchLeetcodeProfile(trimmedUsername);
		if (!profile) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		await upsertIndexedUser(profile);

		return NextResponse.json(
			{ message: "User Profile Added Successfully", profile },
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
