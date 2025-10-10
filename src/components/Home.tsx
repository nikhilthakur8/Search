"use client";

import { useEffect, useRef, useState } from "react";
import {
	BookOpen,
	Fuel,
	Github,
	Globe,
	Linkedin,
	Loader,
	MapPin,
	Plus,
	Search,
	Share2,
	Trophy,
	Twitter,
	TwitterIcon,
} from "lucide-react";
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
import { Loading } from "./Loading";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

interface SearchResult {
	_id: string;
	username: string;
	realName?: string;
	userAvatar: string;
	[key: string]: unknown;
}
function Home() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [hasSearched, setHasSearched] = useState(false);
	const [responseTotal, setResponseTotal] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

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

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	// Fetch data whenever page changes
	useEffect(() => {
		if (page > 1) fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);
	return (
		<div>
			<div className="max-w-3xl mx-auto px-4">
				<div className="flex flex-col md:flex-row space-y-5 md:space-y-0 justify-between  mb-4">
					<div>
						<Button size="sm" asChild>
							<a
								href="https://x.com/nikhilthakur80"
								target="_blank"
								rel="noreferrer"
							>
								<TwitterIcon />
								Builder
							</a>
						</Button>
					</div>
					<div className="space-x-2">
						<Button size="sm" asChild>
							<Link href="/add">
								<Plus />
								Add Me
							</Link>
						</Button>
						<Button size="sm" asChild>
							<a
								href="/ranking/1"
								target="_blank"
								rel="noreferrer"
							>
								<Trophy />
								Ranking
							</a>
						</Button>
						<Button size="sm" asChild>
							<a
								href="https://github.com/sponsors/nikhilthakur8"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-4 py-2 rounded-md !bg-pink-800 text-white font-medium !hover:bg-pink-700 transition-colors"
							>
								<Fuel />
								<span>Fuel Up</span>
							</a>
						</Button>
					</div>
				</div>

				<Card className="mb-8 relative">
					<CardContent>
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									value={query}
									ref={inputRef}
									onChange={(e) => setQuery(e.target.value)}
									spellCheck={false}
									onKeyDown={(e) => {
										console.log(e.key);
										if (e.key === "Escape") {
											setQuery("");
										}
									}}
									placeholder="Enter username or real name..."
									className="pl-10 pr-12 placeholder:text-sm text-sm md:text-base md:placeholder:text-base"
									disabled={loading}
								/>

								<div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 text-xs">
									{query.trim().length === 0 ? (
										<>
											<kbd className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
												⌘
											</kbd>
											<kbd className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
												K
											</kbd>
										</>
									) : (
										<kbd className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
											ESC
										</kbd>
									)}
								</div>
							</div>

							<Button
								type="submit"
								disabled={loading || !query.trim()}
								className="min-w-[100px] text-sm md:text-base"
							>
								{loading ? (
									<>
										<Loader className="h-4 w-4 animate-spin" />
										Searching...
									</>
								) : (
									"Search"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
			{loading && results.length === 0 && (
				<div className="mt-12">
					<Loading />
				</div>
			)}
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
						loader={<Loading />}
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
											<HoveringCard
												hoverId={user.username}
											>
												<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 relative">
													<Image
														src={user.userAvatar!}
														alt=""
														fill
														className="rounded-full"
														unoptimized
													/>
												</div>
											</HoveringCard>
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

type Profile = {
	username: string;
	githubUrl?: string;
	twitterUrl?: string;
	linkedinUrl?: string;
	ranking: number;
	userAvatar: string;
	realName?: string;
	aboutMe?: string;
	school?: string;
	websites?: string[];
	countryName?: string;
	company?: string;
	jobTitle?: string;
};

function HoveringCard({
	children,
	hoverId,
}: {
	children: React.ReactNode;
	hoverId: string;
}) {
	const [profile, setProfile] = useState<Profile | null>(null);

	async function fetchProfile(hoverId: string) {
		try {
			const response = await axios.post(`/api/leetcode-profile`, {
				username: hoverId,
			});
			setProfile(response.data.profile);
		} catch (error) {
			console.error("Error fetching profile data:", error);
		}
	}

	return (
		<HoverCard openDelay={100} onOpenChange={() => fetchProfile(hoverId)}>
			<HoverCardTrigger>{children}</HoverCardTrigger>
			<HoverCardContent
				side="top"
				align="start"
				className="w-80 p-4 rounded-xl shadow-lg bg-white dark:bg-neutral-900 border border-border-muted cursor-pointer"
				onClick={() =>
					window.open(`https://leetcode.com/${hoverId}`, "_blank")
				}
			>
				{profile ? (
					<div className="flex flex-col space-y-3 text-base">
						{/* Avatar + Name */}
						<div className="flex items-center space-x-3">
							<Image
								src={profile.userAvatar}
								alt={profile.username}
								width={48}
								height={48}
								className="rounded-full"
								unoptimized
							/>
							<div>
								<p className="font-medium text-neutral-900 dark:text-neutral-100">
									{profile.realName || profile.username}
								</p>
								<p className="text-neutral-500">
									Rank #{profile.ranking}
								</p>
							</div>
						</div>

						{/* About Me */}
						{profile.aboutMe && (
							<p className="text-neutral-700 dark:text-neutral-300 line-clamp-3">
								{profile.aboutMe}
							</p>
						)}

						{/* Job + Company */}
						{(profile.company || profile.jobTitle) && (
							<p className="text-neutral-600 dark:text-neutral-400">
								{profile.jobTitle ? `${profile.jobTitle} ` : ""}
								{profile.company ? `@ ${profile.company}` : ""}
							</p>
						)}

						{/* School */}
						{profile.school && (
							<p className="flex items-center text-neutral-600 dark:text-neutral-400 space-x-2">
								<BookOpen size={16} />
								<span>{profile.school}</span>
							</p>
						)}

						{/* Country */}
						{profile.countryName && (
							<p className="flex items-center text-neutral-600 dark:text-neutral-400 space-x-2">
								<MapPin size={16} />
								<span>{profile.countryName}</span>
							</p>
						)}

						{/* Websites */}
						{profile.websites && profile.websites.length > 0 && (
							<div className="flex flex-wrap gap-2 items-center text-blue-600 dark:text-blue-400">
								<Globe size={16} />
								{profile.websites.map((site, idx) => (
									<a
										key={idx}
										href={site}
										target="_blank"
										rel="noreferrer"
										onClick={(e) => e.stopPropagation()}
										className="hover:underline whitespace-pre-wrap break-all"
									>
										{site.replace(/^https?:\/\//, "")}
									</a>
								))}
							</div>
						)}

						{/* Social Links */}
						<div className="flex space-x-3 pt-1">
							{profile.githubUrl && (
								<a
									href={profile.githubUrl}
									target="_blank"
									rel="noreferrer"
									className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
									onClick={(e) => e.stopPropagation()}
								>
									<Github size={20} />
								</a>
							)}
							{profile.linkedinUrl && (
								<a
									href={profile.linkedinUrl}
									target="_blank"
									rel="noreferrer"
									className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
									onClick={(e) => e.stopPropagation()}
								>
									<Linkedin size={20} />
								</a>
							)}
							{profile.twitterUrl && (
								<a
									href={profile.twitterUrl}
									target="_blank"
									rel="noreferrer"
									className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
									onClick={(e) => e.stopPropagation()}
								>
									<Twitter size={20} />
								</a>
							)}
						</div>
					</div>
				) : (
					<p className="text-base text-neutral-500">
						<Loader className="inline-block mr-2 h-4 w-4 animate-spin" />
						Loading...
					</p>
				)}
			</HoverCardContent>
		</HoverCard>
	);
}

export default Home;
