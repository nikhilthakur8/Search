import { EB_Garamond } from "next/font/google";

const serif = EB_Garamond({
	weight: ["400", "500"],
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-serif",
});

export const metadata = {
	title: "Service Retired · Search LeetCode Users",
	description:
		"This website is no longer available. Thank you for being part of the journey.",
};

export default function AnnouncementPage() {
	return (
		<main
			className={`${serif.variable} flex min-h-svh items-center justify-center bg-[#faf8f4] px-6 text-[#1a1a1a]`}
		>
			<article className="max-w-xl font-[family-name:var(--font-serif)] text-center">
				<h1 className="text-3xl leading-snug sm:text-4xl">
					This website is no longer available.
				</h1>

				<p className="mt-8 text-lg leading-relaxed text-[#3a3a3a]">
					Due to the rising cost of servers and databases, I am no
					longer able to maintain this project or keep it running.
				</p>

				<p className="mt-5 text-lg leading-relaxed text-[#3a3a3a]">
					Thank you to everyone who used and supported it.
				</p>

				<p className="mt-10 text-lg leading-relaxed">
					If you would like to support my work, you can sponsor me on{" "}
					<a
						href="https://github.com/sponsors/nikhilthakur8"
						target="_blank"
						rel="noopener noreferrer"
						className="italic underline decoration-from-font underline-offset-4 hover:text-[#7a5a3a]"
					>
						GitHub Sponsors
					</a>
					.
				</p>

				<p className="mt-14 text-sm italic text-[#8a8a8a]">
					— Nikhil Thakur
				</p>
			</article>
		</main>
	);
}
