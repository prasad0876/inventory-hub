import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { availabilityLabel } from "@/components/product-card";
import { getProduct } from "@/lib/products.functions";

const qo = (id: string) => queryOptions({ queryKey: ["product", id], queryFn: () => getProduct({ data: { id } }) });

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params, context }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  head: () => ({ meta: [{ title: "Product — VoltMart" }] }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-primary hover:underline">Back to products</Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">Failed to load product.</div>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(qo(id));
  if (!p) return null;
  const a = availabilityLabel(p.quantity);
  const toneClass =
    a.tone === "danger" ? "bg-destructive/10 text-destructive"
    : a.tone === "warn" ? "bg-[oklch(0.95_0.10_75)] text-[oklch(0.40_0.15_60)]"
    : "bg-[oklch(0.94_0.09_150)] text-[oklch(0.35_0.14_150)]";
  const specs = (p.specifications ?? {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-square bg-secondary">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : null}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {p.brand} · {(p as any).categories?.name ?? ""}
            </div>
            <h1 className="mt-1 text-3xl font-bold text-foreground">{p.name}</h1>
            <div className="mt-1 text-sm text-muted-foreground">Model: {p.model || "—"}</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="text-3xl font-bold text-foreground">₹{Number(p.price).toLocaleString("en-IN")}</div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{a.text}</span>
            </div>
            {p.quantity > 0 && <div className="mt-1 text-sm text-muted-foreground">Stock: {p.quantity}</div>}
            {p.description && <p className="mt-6 text-sm leading-relaxed text-foreground/80">{p.description}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/60 p-3"><dt className="text-muted-foreground">Warranty</dt><dd className="font-medium">{p.warranty || "—"}</dd></div>
              <div className="rounded-lg bg-secondary/60 p-3"><dt className="text-muted-foreground">Brand</dt><dd className="font-medium">{p.brand || "—"}</dd></div>
            </dl>
            {Object.keys(specs).length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold text-foreground">Specifications</h2>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 px-3 py-2 text-sm">
                      <div className="text-muted-foreground">{k}</div><div>{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}