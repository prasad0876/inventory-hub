import { Link } from "@tanstack/react-router";

export type ProductCardData = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image_url: string | null;
  categories?: { name: string } | null;
};

export function availabilityLabel(q: number) {
  if (q <= 0) return { text: "Out of Stock", tone: "danger" as const };
  if (q <= 6) return { text: `Only ${q} Left`, tone: "warn" as const };
  return { text: "Available", tone: "ok" as const };
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const a = availabilityLabel(p.quantity);
  const toneClass =
    a.tone === "danger"
      ? "bg-destructive/10 text-destructive"
      : a.tone === "warn"
        ? "bg-[oklch(0.95_0.10_75)] text-[oklch(0.40_0.15_60)]"
        : "bg-[oklch(0.94_0.09_150)] text-[oklch(0.35_0.14_150)]";
  return (
    <Link
      to="/products/$id"
      params={{ id: p.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition md:hover:-translate-y-0.5 md:hover:shadow-[var(--shadow-card)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {p.brand || "—"} · {p.categories?.name ?? ""}
        </div>
        <h3 className="line-clamp-2 font-semibold text-foreground">{p.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="text-lg font-bold text-foreground">
            ₹{Number(p.price).toLocaleString("en-IN")}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}>
            {a.text}
          </span>
        </div>
        {p.quantity > 0 && (
          <div className="text-xs text-muted-foreground">Stock: {p.quantity}</div>
        )}
      </div>
    </Link>
  );
}