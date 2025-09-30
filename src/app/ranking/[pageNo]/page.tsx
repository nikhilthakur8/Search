import React from "react";
import { handleGetRankingPage } from "./action";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";

type User = {
	_id: string;
	username: string;
	realName: string;
	userAvatar: string;
	ranking: number;
	countryName?: string;
};

interface PageProps {
	params: Promise<{
		pageNo: string;
	}>;
}

export default async function Page({ params }: PageProps) {
	const { pageNo } = await params;
	const currentPage = parseInt(pageNo, 10) || 1;
	const { users, totalPages } = (await handleGetRankingPage(currentPage)) || {
		users: [],
		totalPages: 1,
	};

	return (
		<div className="min-h-screen py-20 px-5 max-w-7xl mx-auto">
			<h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-neutral-900 dark:text-neutral-100">
				LeetCode User Rankings
			</h1>

			<Table className="bg-neutral-50 dark:bg-neutral-900 border-collapse border border-neutral-300 dark:border-neutral-700 shadow-md">
				<TableHeader>
					<TableRow>
						<TableHead className="p-4 text-sm md:text-base text-neutral-900 dark:text-neutral-100">
							Rank
						</TableHead>
						<TableHead className="p-4 text-sm md:text-base text-neutral-900 dark:text-neutral-100">
							User
						</TableHead>
						<TableHead className="p-4 text-sm md:text-base text-neutral-900 dark:text-neutral-100">
							Country
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{users.map((user: User) => (
						<TableRow
							key={user._id}
							className="hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
						>
							<TableCell className="pl-4 text-sm md:text-base font-medium text-neutral-900 dark:text-neutral-100">
								{user.ranking}
							</TableCell>
							<TableCell className="flex items-center gap-4 text-sm md:text-base text-neutral-900 dark:text-neutral-100">
								<Image
									src={
										user.userAvatar || "/default-avatar.png"
									}
									width={40}
									height={40}
									alt={user.username}
									className="w-10 h-10 rounded-full object-cover"
									unoptimized
								/>
								<div className="flex flex-col">
									<span className="font-semibold">
										{user.realName || user.username}
									</span>
									<a
										href={`https://leetcode.com/u/${user.username}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:font-semibold transition-all"
									>
										@{user.username}
									</a>
								</div>
							</TableCell>
							<TableCell className="text-sm md:text-base text-neutral-900 dark:text-neutral-100">
								{user.countryName || ""}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<div className="flex justify-center mt-6">
				<Pagination>
					<PaginationContent>
						<PaginationPrevious
							href={`/ranking/${
								currentPage > 1 ? currentPage - 1 : 1
							}`}
							className={
								currentPage === 1
									? "opacity-50 pointer-events-none"
									: ""
							}
						/>
						{[-2, -1, 0, 1, 2].map((index) => {
							const page = currentPage + index;
							if (page < 1 || page > totalPages) return null;
							return (
								<PaginationItem key={page}>
									<PaginationLink
										href={`/ranking/${page}`}
										isActive={page === currentPage}
									>
										{page}
									</PaginationLink>
								</PaginationItem>
							);
						})}
						{currentPage < totalPages - 1 && <PaginationEllipsis />}
						{currentPage < totalPages && (
							<PaginationItem>
								<PaginationLink
									href={`/ranking/${totalPages}`}
									isActive={totalPages === currentPage}
								>
									{totalPages}
								</PaginationLink>
							</PaginationItem>
						)}
						<PaginationNext
							href={`/ranking/${
								currentPage < totalPages
									? currentPage + 1
									: totalPages
							}`}
							className={
								currentPage === totalPages
									? "opacity-50 pointer-events-none"
									: ""
							}
						/>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}

export const revalidate = 3600;
