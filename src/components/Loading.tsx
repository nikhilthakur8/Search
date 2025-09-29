import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

export const Loading = ({
	className,
	size = "size-6",
}: {
	className?: string;
	size?: string;
}) => {
	const quotes = [
		"Sliding through the window of possibilities...",
		"Debugging that tricky edge case...",
		"Reversing linked lists… almost done!",
		"Balancing the binary search tree… carefully.",
		"Waiting for the base case to kick in...",
		"Two pointers, still missing the target...",
		"Sorting results using merge sort...",
		"Traversing the recursion tree…",
		"Running DFS on your patience...",
		"Solving TLEs one testcase at a time...",
		"Greedy won’t work? Time for DP magic...",
		"Trying all permutations... literally.",
		"Stuck on a hard question... send help.",
		"Backtracking through the codebase...",
		"Calculating optimal solution… or brute force?",
		"Binary searching for hope...",
		"Heapifying expectations...",
		"Still debugging that one edge case...",
	];
	const [quotesNo, setQuotesNo] = useState(0);
	useEffect(() => {
		const intervalId = setInterval(() => {
			setQuotesNo((prev) => (prev + 1) % quotes.length);
		}, 1500);
		return () => clearInterval(intervalId);
	}, [quotes.length]);
	return (
		<div
			className={`text-primary/40 w-full h-full text-sm md:text-lg flex justify-center items-center flex-col gap-3 my-10 ${className}`}
		>
			<Loader className={`${size} animate-spin`} />
			<span className="text-center">{quotes[quotesNo]}</span>
		</div>
	);
};
