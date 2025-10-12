import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const { username } = await request.json();
		const trimmedUsername = username.trim();

		const userData = await User.findOne({ username: trimmedUsername });

		// userData is stale if it's older than 30 days
		const isUserDataStale =
			userData &&
			Date.now() - new Date(userData.updatedAt).getTime() >
				30 * 24 * 60 * 60 * 1000;

		if (userData && !isUserDataStale) {
			return NextResponse.json(
				{
					message: "Profile data fetched successfully",
					profile: userData,
				},
				{
					status: 200,
				}
			);
		}

		const query = `
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
		const variables = { username: trimmedUsername };
		const response = await axios.post("https://leetcode.com/graphql/", {
			query,
			variables,
		});
		if (!response.data.data.matchedUser) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		const data = {
			username: response.data.data.matchedUser.username,
			githubUrl: response.data.data.matchedUser.githubUrl,
			twitterUrl: response.data.data.matchedUser.twitterUrl,
			linkedinUrl: response.data.data.matchedUser.linkedinUrl,
			...response.data.data.matchedUser.profile,
		};

		await User.findOneAndUpdate(
			{ username: trimmedUsername },
			{ $set: data },
			{
				new: true,
				upsert: true,
				collation: {
					locale: "en",
					strength: 2,
				},
			}
		);
		return NextResponse.json(
			{
				message: "Profile data fetched and stored successfully",
				profile: data,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		console.error("Error fetching profile data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile data" },
			{ status: 500 }
		);
	}
}
