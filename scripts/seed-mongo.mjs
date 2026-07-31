import { MongoClient } from "mongodb";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Minimal .env.local loader (no extra deps)
const envPath = join(root, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "grayarc";
if (!uri) {
  console.error("MONGODB_URI not set (checked .env.local and environment)");
  process.exit(1);
}

const dataDir = join(root, "data");

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("site_data");

  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} JSON files in ${dataDir}`);

  for (const file of files) {
    const key = file.replace(/\.json$/, "");
    const value = JSON.parse(readFileSync(join(dataDir, file), "utf-8"));
    await collection.updateOne({ _id: key }, { $set: { value } }, { upsert: true });
    console.log(`  seeded "${key}" (${Array.isArray(value) ? value.length + " items" : "object"})`);
  }

  console.log("Done. Verifying...");
  const docs = await collection.find({}).project({ _id: 1 }).toArray();
  console.log("Documents in site_data:", docs.map((d) => d._id).join(", "));

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
