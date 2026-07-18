import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/products.functions";

const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoltMart — Electronics Inventory Store" },
      { name: "description", content: "Browse laptops, mobiles, monitors, SSDs and more with live stock availability." },
      { property: "og:title", content: "VoltMart — Electronics Inventory Store" },
      { property: "og:description", content: "Live electronics catalogue with real-time stock." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO);
  },
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQO);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc" | "name">("newest");

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p: any) => {
      if (!term) return true;
      return (
        p.name?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.model?.toLowerCase().includes(term)
      );
    });
    list = [...list].sort((a: any, b: any) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
    return list;
  }, [products, q, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">All products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse our full automotive parts catalogue.</p>
        </div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or brand…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No products match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
