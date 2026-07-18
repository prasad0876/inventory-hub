import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">All products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse our full automotive parts catalogue.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
