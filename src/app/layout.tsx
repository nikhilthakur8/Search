import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Search LeetCode Users",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<Analytics />
				<Link
					href="https://nextleet.com"
					target="_blank"
					rel="noopener noreferrer"
					className="fixed text-sm border border-gray-500 md:text-base right-5 bottom-5 bg-gray-900 text-white px-5 py-2 rounded-full"
				>
					Made by{" "}
					<span className="font-semibold text-yellow-500">
						NextLeet.com
					</span>
				</Link>
			</body>
		</html>
	);
}
