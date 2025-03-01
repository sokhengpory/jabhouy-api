import { auth } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";
import { item } from "@/route/item";
import { Hono } from "hono";
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()

app.use("*", authMiddleware);

app.onError((err, c) => {
  console.log(err);
  return c.json({ error: err.message });
});

app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));
app.route("/", item)

export default handle(app)

