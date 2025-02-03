import { Hono } from "hono";
import { db } from "./db";
import { items } from "./db/schema";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { eq } from "drizzle-orm";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 600,
}));

app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth") || c.req.path === "/") {
    return next();
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.onError((err, c) => {
  console.log("error");
  return c.json({ error: err.message });
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/", (c) => c.json({ message: "Jabhouy API" }));


app.get("/items", async (c) => {
  const result = await db.select().from(items);
  return c.json(result);
});

app.get("/items/:id", async (c) => {
  const { id } = c.req.param();
  const [result] = await db
    .select()
    .from(items)
    .where(eq(items.id, Number(id)));

  return c.json(result);
});

app.delete("/items/:id", async (c) => {
  const { id } = c.req.param();
  const itemId = Number(id);

  try {
    const [deletedItem] = await db
      .delete(items)
      .where(eq(items.id, itemId))
      .returning();

    if (!deletedItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    return c.json({ message: "Item deleted successfully", item: deletedItem });
  } catch (err) {
    console.error("Error deleting item:", err);
    return c.json({ error: "Failed to delete item" }, 500);
  }
});

export default app;
