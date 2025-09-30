import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

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
	description: "Search LeetCode users by username, real name",
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
					className="fixed text-xs border border-neutral-500 md:text-sm right-5 bottom-5 bg-neutral-900 text-white px-3 py-1.5 rounded-full"
				>
					Made by{" "}
					<span className="font-semibold text-yellow-500">
						NextLeet.com
					</span>
				</Link>
				<Toaster position="top-center" richColors theme="light" />
			</body>
		</html>
	);
}
