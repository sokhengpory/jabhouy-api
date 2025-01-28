import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export const client = createClient({
  url: Bun.env.DATABASE_URL!,
  authToken: Bun.env.DATABASE_AUTH_TOKEN!,
});

export const db = drizzle({ client });
