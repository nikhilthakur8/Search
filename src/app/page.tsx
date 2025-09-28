import { getTotalUsers } from "@/lib/getTotalUsers";
import SearchClient from "@/components/Header";

export default async function Home() {
	const stats = await getTotalUsers();
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-t from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
							Search Your Leetcode Friends
						</h1>
					</div>

					{stats && (
						<>
							<p className="text-base text-muted-foreground text-center mb-2">
								Total Users Indexed Till Now:{" "}
								<span className="font-semibold text-primary">
									{stats.count.toLocaleString()}
								</span>
							</p>
							<p className="text-base text-muted-foreground text-center mb-4">
								<span>
									Indexing Rate:{" "}
									<span className="font-semibold text-primary">
										{stats.indexingRatePerHour.toLocaleString()}
										{" user"}/ hr
									</span>
								</span>
							</p>
						</>
					)}
				</div>
				<SearchClient />
			</div>
		</div>
	);
}

export const revalidate = 600;
