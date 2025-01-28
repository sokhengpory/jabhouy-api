import { Hono } from "hono";
import { db } from "./db";
import { items } from "./db/schema";
import { auth } from "./auth";
import { cors } from "hono/cors";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
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

app.get("/me", async (c) => {
  const result = await auth.api.listUserAccounts();
  return c.json(result);
});

app.get("/items", async (c) => {
  const result = await db.select().from(items);

  return c.json(result);
});

export default app;
