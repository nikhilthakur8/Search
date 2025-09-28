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
async function Page({ params }: PageProps) {
	const { pageNo } = await params;
	const currentPage = parseInt(pageNo, 10) || 1;
	const { users, totalPages } = (await handleGetRankingPage(currentPage)) || {
		users: [],
		totalPages: 1,
	};
	return (
		<div className="min-h-screen py-20 px-5 max-w-7xl mx-auto ">
			<h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
				LeetCode User Rankings
			</h1>

			<Table className="bg-gray-50  border-collapse border border-gray-300 shadow-md ">
				<TableHeader>
					<TableRow className="">
						<TableHead className="p-4 text-sm md:text-base">
							Rank
						</TableHead>
						<TableHead className="p-4 text-sm md:text-base">
							User
						</TableHead>
						<TableHead className="p-4 text-sm md:text-base">
							Country
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{users.map((user: User) => (
						<TableRow
							key={user._id}
							className="hover:bg-gray-100 cursor-pointer transition-colors"
						>
							<TableCell className="pl-4 text-sm md:text-base font-medium">
								{user.ranking}
							</TableCell>
							<TableCell className="flex items-center gap-4 text-sm md:text-base">
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
									<span className="text-gray-500">
										@{user.username}
									</span>
								</div>
							</TableCell>
							<TableCell className="text-sm md:text-base">
								{user.countryName || ""}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<div className="flex justify-center mt-6">
				<Pagination>
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
								if (
									currentPage + index < 1 ||
									currentPage + index > totalPages
								) {
									return null;
								}
								const page = currentPage + index;
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
							{currentPage < totalPages - 1 && (
								<PaginationEllipsis />
							)}
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
				</Pagination>
			</div>
		</div>
	);
}

export default Page;
export const revalidate = 3600;
