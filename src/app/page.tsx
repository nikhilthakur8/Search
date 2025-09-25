"use client";

import { useState } from "react";
import { Search, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface SearchResult {
	_id: string;
	username: string;
	realName?: string;
	[key: string]: unknown;
}

interface SearchResponse {
	results: SearchResult[];
	query: string;
	count: number;
	message?: string;
	error?: string;
}

export default function Home() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!query.trim()) {
			setError("Please enter a search query");
			return;
		}

		setLoading(true);
		setError("");
		setHasSearched(true);

		try {
			const response = await axios.get(
				`/api/search?q=${encodeURIComponent(query.trim())}`
			);

			const data: SearchResponse = response.data.users;
			console.log(data);
			if (response.status !== 200) {
				throw new Error(data.error || data.message || "Search failed");
			}

			setResults(data);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while searching"
			);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<Search className="h-8 w-8 text-primary" />
						<h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
							LeetCode User Search
						</h1>
					</div>
					<p className="text-lg text-muted-foreground max-w-md mx-auto">
						Search for users by username or real name with
						intelligent autocomplete
					</p>
				</div>

				{/* Search Form */}
				<Card className="max-w-2xl mx-auto mb-8">
					<CardHeader>
						<CardTitle className="text-center">
							Search Users
						</CardTitle>
						<CardDescription className="text-center">
							Enter a username or real name to find LeetCode users
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Enter username or real name..."
									className="pl-10"
									disabled={loading}
								/>
							</div>
							<Button
								type="submit"
								disabled={loading || !query.trim()}
								className="min-w-[100px]"
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Searching...
									</>
								) : (
									"Search"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Error Alert */}
				{error && (
					<div className="max-w-2xl mx-auto mb-6">
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</div>
				)}

				{/* Search Results Summary */}
				{hasSearched && !loading && (
					<div className="text-center mb-6">
						<Badge variant="secondary" className="text-sm">
							{results.length > 0
								? `Found ${results.length} result${
										results.length === 1 ? "" : "s"
								  } for "${query}"`
								: `No results found for "${query}"`}
						</Badge>
					</div>
				)}

				{/* Results Grid */}
				{results.length > 0 && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{results.map((user) => (
							<Card
								key={user._id}
								className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
							>
								<CardHeader className="pb-3">
									<div className="flex items-start gap-3">
										<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
											<User className="h-6 w-6 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											{user.realName && (
												<CardTitle className="text-lg leading-tight truncate">
													{user.realName}
												</CardTitle>
											)}
											<CardDescription className="truncate">
												@{user.username}
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between">
										<Badge
											variant="outline"
											className="text-xs"
										>
											ID: {user._id.substring(0, 8)}...
										</Badge>
										<Link
											href={`https://leetcode.com/${user.username}`}
											type="button"
											target="_blank"
											className="h-7 text-xs"
										>
											View Profile
										</Link>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Empty State */}
				{!hasSearched && (
					<div className="text-center mt-12">
						<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
							<Search className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold mb-2">
							Ready to Search
						</h3>
						<p className="text-muted-foreground max-w-md mx-auto">
							Enter a search term above to find LeetCode users.
							Our search supports both usernames and real names
							with fuzzy matching.
						</p>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="text-center mt-12">
						<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
							<Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
						</div>
						<h3 className="text-xl font-semibold mb-2">
							Searching...
						</h3>
						<p className="text-muted-foreground">
							Finding users matching &ldquo;{query}&rdquo;
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
