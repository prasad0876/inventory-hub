import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { listCategories, listProducts } from "@/lib/products.functions";

const categoriesQO = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });
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
    context.queryClient.ensureQueryData(categoriesQO);
    context.queryClient.ensureQueryData(productsQO);
  },
  component: Home,
});

function Home() {
  const { data: cats } = useSuspenseQuery(categoriesQO);
  const { data: products } = useSuspenseQuery(productsQO);
  const featured = products.slice(0, 8);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
              <Zap className="h-3 w-3" /> Live stock updates
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Everything electronic,<br /> in stock and priced right.
            </h1>
            <p className="mt-4 max-w-md text-primary-foreground/85">
              Laptops, mobiles, components and accessories from the brands you trust — with real-time availability.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow transition hover:bg-secondary"
              >
                Browse products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-primary-foreground/85">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Warranty on every item</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Fast dispatch</div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-white/10 p-6 backdrop-blur">
              <div className="grid h-full grid-cols-2 gap-4">
                {featured.slice(0, 4).map((p) => (
                  <div key={p.id} className="overflow-hidden rounded-2xl bg-white/95">
                    {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug } as any}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground transition hover:border-primary hover:text-primary hover:shadow-[var(--shadow-card)]"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
