import { getTotalUsers } from "@/lib/getTotalUsers";
import SearchClient from "@/components/Home";

export default async function Home() {
	const stats = await getTotalUsers();
	return (
		<div className="min-h-svh bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-t from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
							Search Your Leetcode Friends
						</h1>
					</div>

					{stats && (
						<p className="text-base text-muted-foreground text-center mb-2">
							Total Users Indexed Till Now:{" "}
							<span className="font-semibold text-primary">
								{stats.count.toLocaleString()}
							</span>
						</p>
					)}
				</div>
				<SearchClient />
			</div>
		</div>
	);
}

export const revalidate = 600;
