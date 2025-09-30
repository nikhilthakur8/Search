"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

function Page() {
	useEffect(() => {
		document.title = "Add User - LeetCode Search";
	}, []);
	const [username, setUsername] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	useEffect(() => {
		inputRef.current?.focus();
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);
	async function handleAddUser(e: React.FormEvent) {
		e.preventDefault();
		if (!username) {
			toast.error("Please enter a username");
			return;
		}
		setLoading(true);
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
		} finally {
			setLoading(false);
		}
	}
	return (
		<form
			onSubmit={handleAddUser}
			className="min-h-screen flex items-center space-x-5 justify-center max-w-md mx-auto"
		>
			<div className="relative flex-1">
				<Input
					value={username}
					ref={inputRef}
					onChange={(e) => setUsername(e.target.value)}
					spellCheck={false}
					placeholder="Enter Username Only"
					className="pr-12 placeholder:text-sm text-sm md:text-base md:placeholder:text-base"
					disabled={loading}
				/>
				<div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 text-xs">
					<kbd className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
						⌘
					</kbd>
					<kbd className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
						K
					</kbd>
				</div>
			</div>
			<Button disabled={loading}>
				{loading ? (
					<>
						<Loader2 className="animate-spin" /> Adding
					</>
				) : (
					<>
						<Plus />
						Add
					</>
				)}
			</Button>
		</form>
	);
}

export default Page;
