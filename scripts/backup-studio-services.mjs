import { MongoClient } from "mongodb";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB ?? "grayarc");
const docs = await db.collection("site_data").find({ _id: { $in: ["studio", "services"] } }).toArray();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outPath = join(dirname(fileURLToPath(import.meta.url)), `pre-richtext-backup-${stamp}.json`);
writeFileSync(outPath, JSON.stringify(docs, null, 2));
console.log("Backed up to", outPath, "-", docs.map((d) => d._id).join(", "));
await client.close();
