import User from "@/models/leetcodeData";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { username } = await request.json();
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
		const variables = { username };
		const response = await axios.post("https://leetcode.com/graphql/", {
			query,
			variables,
		});
		const data = {
			username: response.data.data.matchedUser.username,
			githubUrl: response.data.data.matchedUser.githubUrl,
			twitterUrl: response.data.data.matchedUser.twitterUrl,
			linkedinUrl: response.data.data.matchedUser.linkedinUrl,
			...response.data.data.matchedUser.profile,
		};

		await User.findOneAndUpdate(
			{ username },
			{ $set: data },
			{ new: true, upsert: true }
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
