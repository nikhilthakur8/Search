#!/usr/bin/env node
/**
 * Streams LeetCode profiles from MongoDB into Meilisearch.
 *
 *   MONGODB_URI=... MONGO_DB=search MONGO_COLLECTION=users \
 *   MEILI_HOST=http://127.0.0.1:7700 MEILI_WRITE_KEY=... \
 *   node scripts/index-mongo-to-meili.mjs
 */
import { MongoClient } from "mongodb";
import { Meilisearch } from "meilisearch";

const {
	MONGODB_URI,
	MONGO_DB,
	MONGO_COLLECTION = "users",
	MEILI_HOST = "http://127.0.0.1:7700",
	MEILI_WRITE_KEY,
	BATCH_SIZE = "1000",
	INDEX_UID = "leetcode_users",
} = process.env;

if (!MONGODB_URI || !MEILI_WRITE_KEY) {
	console.error("MONGODB_URI and MEILI_WRITE_KEY are required");
	process.exit(1);
}

const batchSize = parseInt(BATCH_SIZE, 10);
const toDocumentId = (username, fallback) => {
	const sanitized = String(username).replace(/[^a-zA-Z0-9-_]/g, "_");
	return sanitized.length ? sanitized : String(fallback);
};

const toDocument = (doc) => {
	const createdAt = doc.createdAt ? new Date(doc.createdAt) : null;
	const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : null;
	const ranking = typeof doc.ranking === "number" ? doc.ranking : undefined;

	return {
		id: toDocumentId(doc.username, doc._id),
		username: doc.username,
		realName: doc.realName ?? undefined,
		userAvatar: doc.userAvatar ?? undefined,
		ranking,
		hasRanking: typeof ranking === "number" && ranking > 0,
		countryName: doc.countryName ?? undefined,
		company: doc.company ?? undefined,
		school: doc.school ?? undefined,
		jobTitle: doc.jobTitle ?? undefined,
		aboutMe: doc.aboutMe ?? undefined,
		githubUrl: doc.githubUrl ?? undefined,
		twitterUrl: doc.twitterUrl ?? undefined,
		linkedinUrl: doc.linkedinUrl ?? undefined,
		websites: Array.isArray(doc.websites) ? doc.websites : undefined,
		createdAt: createdAt?.toISOString(),
		createdAtTs: createdAt?.getTime(),
		updatedAt: updatedAt?.toISOString(),
	};
};

const meili = new Meilisearch({ host: MEILI_HOST, apiKey: MEILI_WRITE_KEY });
const index = meili.index(INDEX_UID);

const mongo = new MongoClient(MONGODB_URI);
await mongo.connect();

const db = MONGO_DB ? mongo.db(MONGO_DB) : mongo.db();
const collection = db.collection(MONGO_COLLECTION);

const total = await collection.estimatedDocumentCount();
console.log(`source: ${db.databaseName}.${MONGO_COLLECTION} (~${total} docs)`);
console.log(`target: ${MEILI_HOST}/indexes/${INDEX_UID}`);

const cursor = collection.find({}, { batchSize });
let buffer = [];
let sent = 0;
let lastTask = null;

const flush = async () => {
	if (!buffer.length) return;
	lastTask = await index.addDocuments(buffer, { primaryKey: "id" });
	sent += buffer.length;
	buffer = [];
	process.stdout.write(`\rqueued ${sent}/${total}`);
	// keep the task queue from outrunning a 1 GB box
	while ((await meili.tasks.getTasks({ statuses: ["enqueued"] })).results.length > 20) {
		await new Promise((r) => setTimeout(r, 1000));
	}
};

for await (const doc of cursor) {
	if (!doc.username) continue;
	buffer.push(toDocument(doc));
	if (buffer.length >= batchSize) await flush();
}
await flush();

console.log(`\nqueued ${sent} documents, waiting for indexing to finish...`);
if (lastTask) await meili.tasks.waitForTask(lastTask.taskUid, { timeout: 0 });

const stats = await index.getStats();
console.log(`done. index holds ${stats.numberOfDocuments} documents`);

await mongo.close();
