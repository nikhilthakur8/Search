import User from "@/models/leetcodeData";
import connectDB from "@/utils/db";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

async function handleGetLeetCodeProfileAndSave(username: string) {
	
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

	const matchedUser = response.data.data.matchedUser;
	if (!matchedUser) return null;

	const data = {
		username: matchedUser.username,
		githubUrl: matchedUser.githubUrl,
		twitterUrl: matchedUser.twitterUrl,
		linkedinUrl: matchedUser.linkedinUrl,
		...matchedUser.profile,
	};

	const updatedUser = await User.findOneAndUpdate(
		{ username },
		{ $set: data },
		{
			new: true,
			upsert: true,
			collation: { locale: "en", strength: 2 },
		}
	);

	return updatedUser;
}

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const { username } = await request.json();

		// Find in Database (case-insensitive)
		let userData = await User.findOne({ username }).collation({
			locale: "en",
			strength: 2,
		});

		// if Found in DB, return and do fire and forget to update in background
		if (userData) {

			handleGetLeetCodeProfileAndSave(username);

			return NextResponse.json(
				{
					message: "Profile data fetched successfully (from cache)",
					profile: userData,
				},
				{ status: 200 }
			);

		} else {

			// else fetch from leetcode, store in DB and return
			userData = await handleGetLeetCodeProfileAndSave(username);

			if (!userData) {
				return NextResponse.json(
					{ error: "username might have changed or deleted" },
					{ status: 404 }
				);
			}

			return NextResponse.json(
				{
					message: "Profile data fetched and stored successfully",
					profile: userData,
				},
				{ status: 200 }
			);
		}
	} catch (error) {

		console.error("Error fetching profile data:", error);

		return NextResponse.json(
			{ error: "Failed to fetch profile data" },
			{ status: 500 }
		);
	}
}
