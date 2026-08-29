#!/usr/bin/env node
/**
 * Streams a mongoexport JSON array (Extended JSON) into Meilisearch.
 * Tolerates a truncated tail - the trailing partial document is dropped.
 *
 *   MEILI_HOST=http://127.0.0.1:7700 MEILI_WRITE_KEY=... \
 *   node scripts/index-json-to-meili.mjs <file.json>
 */
import fs from "node:fs";
import { Meilisearch } from "meilisearch";

const {
	MEILI_HOST = "http://127.0.0.1:7700",
	MEILI_WRITE_KEY,
	BATCH_SIZE = "5000",
	INDEX_UID = "leetcode_users",
	DRY_RUN,
	SKIP_DOCS = "0",
} = process.env;

const file = process.argv[2];
const dryRun = DRY_RUN === "1";
const skipDocs = parseInt(SKIP_DOCS, 10) || 0;

if (!file || (!MEILI_WRITE_KEY && !dryRun)) {
	console.error("usage: MEILI_WRITE_KEY=... node index-json-to-meili.mjs <file.json>");
	process.exit(1);
}

const batchSize = parseInt(BATCH_SIZE, 10);
const meili = new Meilisearch({ host: MEILI_HOST, apiKey: MEILI_WRITE_KEY });
const index = meili.index(INDEX_UID);

const toDocumentId = (username, fallback) => {
	const sanitized = String(username).replace(/[^a-zA-Z0-9-_]/g, "_");
	return sanitized.slice(0, 480) || String(fallback);
};

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const str = (v) => (typeof v === "string" && v.length ? v : undefined);
const date = (v) => (v && typeof v === "object" && v.$date ? new Date(v.$date) : null);

const toDocument = (doc) => {
	const createdAt = date(doc.createdAt);
	const updatedAt = date(doc.updatedAt);
	const ranking = num(doc.ranking);

	return {
		id: toDocumentId(doc.username, doc._id?.$oid),
		username: doc.username,
		realName: str(doc.realName),
		userAvatar: str(doc.userAvatar),
		ranking,
		hasRanking: typeof ranking === "number" && ranking > 0,
		rating: num(doc.rating),
		contestRanking: num(doc.contestRanking),
		dataRegion: str(doc.dataRegion),
		countryName: str(doc.countryName),
		company: str(doc.company),
		school: str(doc.school),
		jobTitle: str(doc.jobTitle),
		aboutMe: str(doc.aboutMe),
		githubUrl: str(doc.githubUrl),
		twitterUrl: str(doc.twitterUrl),
		linkedinUrl: str(doc.linkedinUrl),
		websites: Array.isArray(doc.websites) && doc.websites.length ? doc.websites : undefined,
		createdAt: createdAt?.toISOString(),
		createdAtTs: createdAt?.getTime(),
		updatedAt: updatedAt?.toISOString(),
	};
};

const total = fs.statSync(file).size;
console.log(`source: ${file} (${(total / 1e9).toFixed(2)} GB)`);
console.log(`target: ${MEILI_HOST}/indexes/${INDEX_UID}`);

let batch = [];
let sent = 0;
let parsed = 0;
let skipped = 0;
let bytes = 0;
let lastTask = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A stale tunnel or a busy server must not kill a multi-hour import.
const withRetry = async (label, fn) => {
	for (let attempt = 1; ; attempt++) {
		try {
			return await fn();
		} catch (err) {
			if (attempt >= 30) throw err;
			const wait = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
			process.stdout.write(`\n${label} failed (attempt ${attempt}): ${err?.message ?? err}; retrying in ${wait / 1000}s\n`);
			await sleep(wait);
		}
	}
};

const throttle = async () => {
	while (
		(await withRetry("getTasks", () => meili.tasks.getTasks({ statuses: ["enqueued"] })))
			.results.length > 10
	) {
		await sleep(500);
	}
};

const flush = async () => {
	if (!batch.length) return;
	if (dryRun) {
		sent += batch.length;
		batch = [];
		process.stdout.write(`\rparsed ${sent} docs  (${((bytes / total) * 100).toFixed(1)}% of file, ${skipped} skipped)`);
		return;
	}
	await throttle();
	const payload = batch;
	lastTask = await withRetry("addDocuments", () => index.addDocuments(payload, { primaryKey: "id" }));
	sent += batch.length;
	batch = [];
	const pct = ((bytes / total) * 100).toFixed(1);
	process.stdout.write(`\rqueued ${sent} docs  (${pct}% of file, ${skipped} skipped)`);
};

// Scan for balanced top-level objects; a truncated final object is never emitted.
let buf = "";
let pos = 0;
let depth = 0;
let inStr = false;
let esc = false;
let start = -1;

const stream = fs.createReadStream(file, { encoding: "utf8", highWaterMark: 1 << 20 });

for await (const chunk of stream) {
	bytes += Buffer.byteLength(chunk, "utf8");
	buf += chunk;
	let consumed = 0;

	// resume exactly where the previous chunk stopped - never rescan, or the
	// carried depth/inStr state gets applied twice and the scan never closes
	for (let i = pos; i < buf.length; i++) {
		const c = buf[i];
		if (inStr) {
			if (esc) esc = false;
			else if (c === "\\") esc = true;
			else if (c === '"') inStr = false;
			continue;
		}
		if (c === '"') { inStr = true; continue; }
		if (c === "{") { if (depth === 0) start = i; depth++; continue; }
		if (c !== "}") continue;

		depth--;
		if (depth !== 0) continue;

		const raw = buf.slice(start, i + 1);
		consumed = i + 1;
		try {
			const doc = JSON.parse(raw);
			parsed++;
			// resume: everything before this offset is already in the index
			if (parsed > skipDocs) {
				if (doc.username) batch.push(toDocument(doc));
				else skipped++;
			}
		} catch {
			skipped++;
		}
		if (batch.length >= batchSize) await flush();
	}

	pos = buf.length;
	if (consumed) {
		buf = buf.slice(consumed);
		pos -= consumed;
		if (start >= 0) start -= consumed;
	}
	if (buf.length > 64 * 1024 * 1024) {
		throw new Error(`scanner stalled: ${buf.length} bytes without a complete object`);
	}
}

await flush();

if (depth !== 0 || buf.trim().replace(/^[,\s\]]+/, "").length) {
	console.log(`\nnote: file ends mid-document - trailing partial record dropped`);
}

if (dryRun) {
	console.log(`\ndry run: ${parsed} documents parsed, ${skipped} skipped. nothing sent.`);
	process.exit(0);
}

console.log(`\nparsed ${parsed}, queued ${sent}, skipped ${skipped}. waiting for indexing...`);
if (lastTask) await meili.tasks.waitForTask(lastTask.taskUid, { timeout: 0 });

let stats = await index.getStats();
while (stats.isIndexing) {
	await new Promise((r) => setTimeout(r, 2000));
	stats = await index.getStats();
}
console.log(`done. index holds ${stats.numberOfDocuments} documents`);
