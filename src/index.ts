import { Hono } from "hono";
import { db } from "./db";
import { items } from "./db/schema";
import { auth } from "./auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/items", async (c) => {
  const result = await db.select().from(items);

  return c.json(result);
});

export default app;
