"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import React, { useEffect } from "react";
import { toast } from "sonner";

function Page() {
	useEffect(() => {
		document.title = "Add User - LeetCode Search";
	}, []);
	const [username, setUsername] = React.useState("");
	async function handleAddUser(e: React.FormEvent) {
		e.preventDefault();
		if (!username) {
			toast.error("Please enter a username");
			return;
		}
		try {
			await axios.post("/api/leetcode-profile", { username });
			toast.success(`User ${username} added successfully`);
			setUsername("");
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				toast.error(
					`Error: ${error.response?.data.error || error.message}`
				);
			} else {
				toast.error(`Error: ${(error as Error).message}`);
			}
		}
	}
	return (
		<form
			onSubmit={handleAddUser}
			className="min-h-screen flex items-center space-x-5 justify-center max-w-md mx-auto"
		>
			<Input
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter UserName Only"
				spellCheck={false}
			/>
			<Button>Add</Button>
		</form>
	);
}

export default Page;
