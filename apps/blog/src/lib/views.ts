import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_POSTGRES_URL_NON_POOLING;

const sql = connectionString ? neon(connectionString) : null;

let tableReady: Promise<void> | null = null;

function ensureTable() {
  if (!sql) return Promise.resolve();
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS post_views (
          slug TEXT PRIMARY KEY,
          count INTEGER NOT NULL DEFAULT 0
        )
      `;
    })();
  }
  return tableReady;
}

export async function incrementViews(slug: string): Promise<number> {
  if (!sql) return 0;
  try {
    await ensureTable();
    const rows = (await sql`
      INSERT INTO post_views (slug, count)
      VALUES (${slug}, 1)
      ON CONFLICT (slug) DO UPDATE SET count = post_views.count + 1
      RETURNING count
    `) as { count: number }[];
    return rows[0]?.count ?? 0;
  } catch (error) {
    console.error("incrementViews failed", error);
    return 0;
  }
}

export async function getAllViews(): Promise<Record<string, number>> {
  if (!sql) return {};
  try {
    await ensureTable();
    const rows = (await sql`SELECT slug, count FROM post_views`) as {
      slug: string;
      count: number;
    }[];
    return Object.fromEntries(rows.map((row) => [row.slug, row.count]));
  } catch (error) {
    console.error("getAllViews failed", error);
    return {};
  }
}
