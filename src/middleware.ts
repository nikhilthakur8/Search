import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The site is retired. Redirect every visitor to the announcement page.
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname === "/announcement") {
		return NextResponse.next();
	}

	const url = request.nextUrl.clone();
	url.pathname = "/announcement";
	url.search = "";
	return NextResponse.redirect(url);
}

export const config = {
	// Run on all routes except Next.js internals, the announcement page,
	// and common static files.
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
	],
};
