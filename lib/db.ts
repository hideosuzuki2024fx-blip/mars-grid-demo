import { sql } from "@vercel/postgres";

// Neon integration on Vercel commonly provides DATABASE_URL / DATABASE_URL_UNPOOLED.
// This app primarily uses @vercel/postgres which expects POSTGRES_URL style env vars,
// so we map them automatically when missing.
function ensureEnvCompatibility() {
  if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
    process.env.POSTGRES_URL = process.env.DATABASE_URL;
  }

  if (!process.env.POSTGRES_URL_NON_POOLING && process.env.DATABASE_URL_UNPOOLED) {
    process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL_UNPOOLED;
  }

  // Fallback: if only DATABASE_URL exists, allow it for non-pooling too.
  if (!process.env.POSTGRES_URL_NON_POOLING && process.env.DATABASE_URL) {
    process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL;
  }
}

export function requireDbConfigured() {
  ensureEnvCompatibility();

  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error(
      "Postgres is not configured. Set DATABASE_URL (Neon) or POSTGRES_URL (Vercel Postgres compatible)."
    );
  }
}

export { sql };
