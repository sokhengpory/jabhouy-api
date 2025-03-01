import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const item = new Hono().basePath('/items')

item.get("/", async (c) => {
    const result = await db.select().from(items);
    return c.json(result);
});

item.get("/:id", async (c) => {
    const { id } = c.req.param();
    const [result] = await db
        .select()
        .from(items)
        .where(eq(items.id, Number(id)));

    return c.json(result);
});

item.delete("/:id", async (c) => {
    const { id } = c.req.param();
    const itemId = Number(id);

    const [deletedItem] = await db
        .delete(items)
        .where(eq(items.id, itemId))
        .returning();

    return c.json({ message: "Item deleted successfully", item: deletedItem });
});