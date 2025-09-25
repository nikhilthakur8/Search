"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";

interface SearchResult {
	_id: string;
	username: string;
	realName?: string;
	userAvatar: string;
	[key: string]: unknown;
}
function Header() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [hasSearched, setHasSearched] = useState(false);
	const [responseTotal, setResponseTotal] = useState(0);

	const fetchUsers = async (reset = false) => {
		if (!query.trim()) return;

		setLoading(true);
		try {
			const response = await axios.get(
				`/api/search?q=${encodeURIComponent(
					query.trim()
				)}&page=${page}&limit=100`
			);

			if (response.status !== 200) {
				throw new Error(response.data.error || "Search failed");
			}

			const users: SearchResult[] = response.data.users;

			setResults((prev) => (reset ? users : [...prev, ...users]));
			setHasMore(response.data.pagination.hasMore);
			setResponseTotal(response.data.pagination.total);
		} catch (err: unknown) {
			let message = "An error occurred while searching";
			if (err instanceof AxiosError) {
				message = err.response?.data?.message || message;
			} else if (err instanceof Error) {
				message = err.message;
			}
			toast.error(message);
			setHasMore(false);
		} finally {
			setLoading(false);
		}
	};
	const [totalUsers, setTotalUsers] = useState<number | null>(null);

	useEffect(() => {
		// Fetch total user count on initial load
		const fetchTotalUsers = async () => {
			try {
				const response = await axios.get("/api/count");
				if (response.status === 200) {
					setTotalUsers(response.data.count);
				}
			} catch (error) {
				console.error("Failed to fetch total user count:", error);
			}
		};
		fetchTotalUsers();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		setHasSearched(true);
		setResults([]);
		fetchUsers(true);
	};

	const fetchNextPage = () => {
		setPage((prev) => prev + 1);
	};

	// Fetch data whenever page changes
	useEffect(() => {
		if (page > 1) fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);
	return (
		<div>
			<Card className="max-w-2xl mx-auto mb-8">
				<CardHeader>
					<CardTitle className="text-center md:text-lg">
						Search Users
					</CardTitle>
					<CardDescription className="text-center text-sm md:!text-base">
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

			{/* Results with Infinite Scroll */}
			{results.length > 0 && (
				<div className="max-w-6xl mx-auto">
					<p className="text-muted-foreground mb-4 text-center">
						Total Users Found: {` ${responseTotal}`}
					</p>
					<InfiniteScroll
						dataLength={results.length}
						next={fetchNextPage}
						hasMore={hasMore}
						loader={
							<div className="text-center overflow-hidden mt-6">
								<Loader2 className="h-10 w-10 text-muted-foreground animate-spin mx-auto" />
							</div>
						}
						endMessage={
							<p className="text-center mt-6 text-muted-foreground">
								No more results
							</p>
						}
					>
						<div className="grid overflow-hidden gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{results.map((user, idx) => (
								<Card
									key={idx + 1}
									className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
								>
									<CardHeader className="pb-3">
										<div className="flex items-start gap-3">
											<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 relative hover:sticky hover:w-32 hover:h-32 transition-all ">
												<Image
													src={user.userAvatar!}
													alt=""
													fill
													className="rounded-full"
													unoptimized
												/>
											</div>
											<div className="flex-1 min-w-0">
												{user.realName && (
													<CardTitle className="text-lg break-all whitespace-pre-wrap leading-tight truncate">
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
												ID: {user._id.substring(0, 8)}
												...
											</Badge>
											<Link
												href={`https://leetcode.com/${user.username}`}
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
					</InfiniteScroll>
				</div>
			)}

			{/* No results */}
			{hasSearched && results.length === 0 && !loading && (
				<div className="text-center mt-12 text-muted-foreground">
					No results found for &ldquo;{query}&rdquo;
				</div>
			)}
		</div>
	);
}

export default Header;
