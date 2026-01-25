import { sql } from "@vercel/postgres";

export function requireDbConfigured() {
  // Vercel Storage(Postgres)を接続すると POSTGRES_URL 等が注入されます
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error(
      "Postgres is not configured. Connect a Postgres integration in Vercel (Project > Storage)."
    );
  }
}

export { sql };
