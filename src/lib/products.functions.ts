import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

async function logActivity(
  ctx: { supabase: any; userId: string; claims: any },
  action: string,
  entity: string,
  entity_id: string | null,
  meta: Record<string, unknown> = {}
) {
  await ctx.supabase.from("activity_logs").insert({
    admin_id: ctx.userId,
    admin_email: (ctx.claims as any)?.email ?? "",
    action,
    entity,
    entity_id,
    meta,
  });
}

// ---------- PUBLIC READS ----------

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const s = publicClient();
    const { data: row, error } = await s
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- ADMIN CHECK ----------

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

// ---------- ADMIN: PRODUCTS ----------

const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  brand: z.string().max(100).default(""),
  model: z.string().max(100).default(""),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(4000).default(""),
  specifications: z.record(z.string(), z.any()).default({}),
  price: z.number().min(0),
  quantity: z.number().int().min(0),
  warranty: z.string().max(100).default(""),
  image_url: z.string().url().nullable().optional(),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    if (id) {
      const { data: row, error } = await context.supabase
        .from("products").update(values).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      await logActivity(context, "update", "product", id, { name: values.name });
      return row;
    } else {
      const { data: row, error } = await context.supabase
        .from("products").insert(values).select().single();
      if (error) throw new Error(error.message);
      await logActivity(context, "create", "product", row.id, { name: values.name });
      return row;
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "product", data.id);
    return { ok: true };
  });

export const updateStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; quantity: number }) =>
    z.object({ id: z.string().uuid(), quantity: z.number().int().min(0) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("products").update({ quantity: data.quantity }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "update_stock", "product", data.id, { quantity: data.quantity });
    return { ok: true };
  });

// ---------- ADMIN: CATEGORIES ----------

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; name: string }) =>
    z.object({ id: z.string().uuid().optional(), name: z.string().min(1).max(100) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (data.id) {
      const { error } = await context.supabase.from("categories")
        .update({ name: data.name, slug }).eq("id", data.id);
      if (error) throw new Error(error.message);
      await logActivity(context, "update", "category", data.id, { name: data.name });
    } else {
      const { data: row, error } = await context.supabase.from("categories")
        .insert({ name: data.name, slug }).select().single();
      if (error) throw new Error(error.message);
      await logActivity(context, "create", "category", row.id, { name: data.name });
    }
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "category", data.id);
    return { ok: true };
  });

// ---------- ADMIN: DUES ----------

const dueInput = z.object({
  id: z.string().uuid().optional(),
  customer_name: z.string().min(1).max(100),
  phone: z.string().max(30).default(""),
  product_name: z.string().max(200).default(""),
  amount: z.number().min(0),
  due_date: z.string().nullable().optional(),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  notes: z.string().max(1000).default(""),
});

export const listDues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("pending_dues").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertDue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => dueInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    if (id) {
      const { error } = await context.supabase.from("pending_dues").update(values).eq("id", id);
      if (error) throw new Error(error.message);
      await logActivity(context, "update", "due", id, { customer: values.customer_name });
    } else {
      const { data: row, error } = await context.supabase
        .from("pending_dues").insert(values).select().single();
      if (error) throw new Error(error.message);
      await logActivity(context, "create", "due", row.id, { customer: values.customer_name });
    }
    return { ok: true };
  });

export const deleteDue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("pending_dues").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "delete", "due", data.id);
    return { ok: true };
  });

export const markDuePaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("pending_dues").update({ status: "paid" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context, "mark_paid", "due", data.id);
    return { ok: true };
  });

// ---------- ADMIN: ACTIVITY ----------

export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- ADMIN: DASHBOARD STATS ----------

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [products, categories, dues] = await Promise.all([
      context.supabase.from("products").select("id, quantity, category_id, categories(name)"),
      context.supabase.from("categories").select("id"),
      context.supabase.from("pending_dues").select("id, amount, status, due_date"),
    ]);
    const prods = products.data ?? [];
    const cats = categories.data ?? [];
    const dueRows = dues.data ?? [];
    const inStock = prods.filter((p: any) => (p.quantity ?? 0) > 0).length;
    const outOfStock = prods.filter((p: any) => (p.quantity ?? 0) === 0).length;
    const byCategory: Record<string, number> = {};
    for (const p of prods as any[]) {
      const name = p.categories?.name ?? "Uncategorized";
      byCategory[name] = (byCategory[name] ?? 0) + (p.quantity ?? 0);
    }
    const totalDue = dueRows.filter((d: any) => d.status !== "paid").reduce((a: number, d: any) => a + Number(d.amount ?? 0), 0);
    const overdue = dueRows.filter((d: any) => d.status !== "paid" && d.due_date && new Date(d.due_date) < new Date()).length;
    return {
      totalProducts: prods.length,
      inStock,
      outOfStock,
      categories: cats.length,
      totalDue,
      overdue,
      pendingCustomers: dueRows.filter((d: any) => d.status === "pending").length,
      paidCustomers: dueRows.filter((d: any) => d.status === "paid").length,
      byCategory: Object.entries(byCategory).map(([name, qty]) => ({ name, qty })),
    };
  });