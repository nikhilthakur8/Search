/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useTheme } from "next-themes";
import { useRef, useCallback, useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

type Props = { className?: string };

export const AnimatedThemeToggler = ({ className }: Props) => {
	const { resolvedTheme, setTheme } = useTheme();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme === "dark";

	const toggleTheme = useCallback(async () => {
		if (!buttonRef.current) return;

		await document.startViewTransition(() => {
			flushSync(() => {
				setTheme(isDark ? "light" : "dark");
			});
		}).ready;

		const { top, left, width, height } =
			buttonRef.current.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const maxRadius = Math.hypot(
			Math.max(x, window.innerWidth - x),
			Math.max(y, window.innerHeight - y)
		);

		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${maxRadius}px at ${x}px ${y}px)`,
				],
			},
			{
				duration: 700,
				easing: "ease-in-out",
				pseudoElement: "::view-transition-new(root)",
			}
		);
	}, [isDark, setTheme]);

	if (!mounted)
		return (
			<button
				ref={buttonRef}
				className={cn("p-2 rounded-full", className)}
				disabled
			>
				<Moon />
			</button>
		);

	return (
		<button
			ref={buttonRef}
			onClick={toggleTheme}
			className={cn("p-2 rounded-full", className)}
		>
			{isDark ? <Sun /> : <Moon />}
		</button>
	);
};
