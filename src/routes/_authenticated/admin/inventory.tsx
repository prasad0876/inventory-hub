import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { listProducts, updateStock } from "@/lib/products.functions";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  component: Inventory,
});

function Inventory() {
  const qc = useQueryClient();
  const list = useServerFn(listProducts);
  const upd = useServerFn(updateStock);
  const { data = [] } = useQuery({ queryKey: ["products"], queryFn: list });
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const rows = data.filter((p: any) =>
    filter === "all" ? true : filter === "low" ? p.quantity > 0 && p.quantity <= 6 : p.quantity === 0
  );

  const mut = useMutation({
    mutationFn: (v: { id: string; quantity: number }) => upd({ data: v }),
    onSuccess: (_r, v) => {
      toast.success("Stock updated");
      setDrafts((d) => { const n = { ...d }; delete n[v.id]; return n; });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminShell title="Inventory">
      <div className="mb-4 flex gap-2">
        {(["all", "low", "out"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm ${filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>
            {f === "all" ? "All" : f === "low" ? "Low stock (≤6)" : "Out of stock"}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr><th className="p-3">Product</th><th className="p-3">Current</th><th className="p-3">New qty</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((p: any) => {
              const val = drafts[p.id] ?? p.quantity;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand} · {p.categories?.name}</div>
                  </td>
                  <td className="p-3">
                    <span className={p.quantity === 0 ? "text-destructive font-semibold" : p.quantity <= 6 ? "text-orange-600 font-semibold" : ""}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <input type="number" min={0} value={val}
                      onChange={(e) => setDrafts({ ...drafts, [p.id]: Number(e.target.value) })}
                      className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-sm" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => mut.mutate({ id: p.id, quantity: val })}
                      disabled={val === p.quantity || mut.isPending}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                    >Save</button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No items.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}