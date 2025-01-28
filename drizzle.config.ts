import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: Bun.env.DATABASE_URL!,
    authToken: Bun.env.DATABASE_AUTH_TOKEN!,
  },
});
