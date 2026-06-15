import { Instrument_Serif } from "next/font/google";
import { Heart, ArrowUpRight } from "lucide-react";

const display = Instrument_Serif({
	weight: "400",
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-display",
});

export const metadata = {
	title: "Service Retired · Search LeetCode Users",
	description:
		"This website is no longer available. Thank you for being part of the journey.",
};

export default function AnnouncementPage() {
	return (
		<main
			className={`${display.variable} relative min-h-svh overflow-hidden bg-[#0a0908] text-neutral-200 antialiased`}
		>
			{/* Ember glow */}
			<div
				aria-hidden
				className="ann-glow pointer-events-none absolute left-1/2 top-[-14rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full"
				style={{
					background:
						"radial-gradient(closest-side, rgba(217,119,87,0.30), rgba(217,119,87,0.06) 60%, transparent 80%)",
				}}
			/>
			{/* Floor wash */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
				style={{
					background:
						"linear-gradient(to top, rgba(217,119,87,0.07), transparent)",
				}}
			/>
			{/* Fine grain */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
				}}
			/>
			{/* Hairline frame */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-3 rounded-2xl border border-white/[0.06] md:inset-6"
			/>

			<div className="relative z-10 mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
				{/* Status */}
				<div
					className="ann-rise flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-neutral-400 backdrop-blur"
					style={{ animationDelay: "0.05s" }}
				>
					<span
						className="ann-ember h-1.5 w-1.5 rounded-full bg-[#d97757]"
						style={{ boxShadow: "0 0 10px 2px rgba(217,119,87,0.7)" }}
					/>
					Service Offline
				</div>

				{/* Headline */}
				<h1
					className="ann-rise mt-9 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-neutral-50 sm:text-6xl md:text-7xl"
					style={{ animationDelay: "0.15s" }}
				>
					The search has
					<br />
					<span className="italic text-[#e8a98f]">gone quiet.</span>
				</h1>

				{/* Body */}
				<p
					className="ann-rise mt-7 max-w-md text-pretty text-[0.97rem] leading-relaxed text-neutral-400"
					style={{ animationDelay: "0.28s" }}
				>
					This website is no longer available. The rising cost of
					servers and databases made it impossible to keep the lights
					on, and I&apos;m no longer able to maintain it.
				</p>
				<p
					className="ann-rise mt-3 max-w-md text-pretty text-[0.97rem] leading-relaxed text-neutral-400"
					style={{ animationDelay: "0.36s" }}
				>
					Thank you to everyone who searched, shared, and supported
					along the way.
				</p>

				{/* CTA */}
				<div
					className="ann-rise mt-11 flex flex-col items-center gap-4"
					style={{ animationDelay: "0.48s" }}
				>
					<a
						href="https://github.com/sponsors/nikhilthakur8"
						target="_blank"
						rel="noopener noreferrer"
						className="group inline-flex items-center gap-2.5 rounded-full bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_-4px_rgba(217,119,87,0.55)]"
					>
						<Heart className="h-4 w-4 fill-[#d97757] text-[#d97757] transition-transform duration-300 group-hover:scale-110" />
						Sponsor on GitHub
						<ArrowUpRight className="h-4 w-4 -translate-y-px text-neutral-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1" />
					</a>
					<p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-neutral-600">
						Your support keeps the next idea alive
					</p>
				</div>
			</div>

			{/* Footer note */}
			<div
				className="ann-rise absolute inset-x-0 bottom-6 z-10 text-center"
				style={{ animationDelay: "0.6s" }}
			>
				<p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-neutral-700">
					Search LeetCode Users · Retired 2026
				</p>
			</div>
		</main>
	);
}
