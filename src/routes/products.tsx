import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { listCategories, listProducts } from "@/lib/products.functions";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  sort: z.enum(["new", "price_asc", "price_desc", "name"]).optional(),
  availability: z.enum(["all", "in_stock", "out"]).optional(),
});

const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });
const categoriesQO = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "All Products — VoltMart" }, { name: "description", content: "Browse and filter the full electronics catalogue." }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO);
    context.queryClient.ensureQueryData(categoriesQO);
  },
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products } = useSuspenseQuery(productsQO);
  const { data: cats } = useSuspenseQuery(categoriesQO);
  const [q, setQ] = useState(search.q ?? "");
  const [priceMax, setPriceMax] = useState<number | "">("");

  const brands = useMemo(() => Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean))).sort(), [products]);

  const filtered = useMemo(() => {
    let list = [...(products as any[])];
    const query = (q || search.q || "").toLowerCase();
    if (query) list = list.filter((p) => [p.name, p.brand, p.model].some((v) => (v ?? "").toLowerCase().includes(query)));
    if (search.category) list = list.filter((p) => p.categories?.slug === search.category);
    if (search.brand) list = list.filter((p) => p.brand === search.brand);
    if (search.availability === "in_stock") list = list.filter((p) => p.quantity > 0);
    if (search.availability === "out") list = list.filter((p) => p.quantity === 0);
    if (priceMax !== "") list = list.filter((p) => Number(p.price) <= Number(priceMax));
    switch (search.sort) {
      case "price_asc": list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price_desc": list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list;
  }, [products, q, search, priceMax]);

  const setSearch = (patch: Record<string, string | undefined>) =>
    navigate({ search: (prev: any) => ({ ...prev, ...patch }) as any });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">All products</h1>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-4 h-max">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Search</label>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setSearch({ q: e.target.value || undefined }); }}
                placeholder="Name, brand, model…"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Category</label>
              <select
                value={search.category ?? ""}
                onChange={(e) => setSearch({ category: e.target.value || undefined })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Brand</label>
              <select
                value={search.brand ?? ""}
                onChange={(e) => setSearch({ brand: e.target.value || undefined })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {brands.map((b) => <option key={b as string} value={b as string}>{b as string}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Availability</label>
              <select
                value={search.availability ?? "all"}
                onChange={(e) => setSearch({ availability: e.target.value === "all" ? undefined : e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="in_stock">In stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Max price (₹)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : "")}
                placeholder="Any"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Sort by</label>
              <select
                value={search.sort ?? "new"}
                onChange={(e) => setSearch({ sort: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="new">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </aside>

          <div>
            <div className="mb-3 text-sm text-muted-foreground">{filtered.length} product{filtered.length === 1 ? "" : "s"}</div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No products match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => <ProductCard key={p.id} p={p as any} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}