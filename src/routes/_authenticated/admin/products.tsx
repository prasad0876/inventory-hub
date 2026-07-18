import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listProducts, listCategories, upsertProduct, deleteProduct } from "@/lib/products.functions";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type FormState = {
  id?: string;
  name: string; brand: string; model: string;
  category_id: string | null;
  description: string; price: number; quantity: number;
  warranty: string; image_url: string;
  specifications: string;
};
const empty: FormState = {
  name: "", brand: "", model: "", category_id: null,
  description: "", price: 0, quantity: 0,
  warranty: "", image_url: "", specifications: "{}",
};

function AdminProducts() {
  const qc = useQueryClient();
  const listP = useServerFn(listProducts);
  const listC = useServerFn(listCategories);
  const save = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: listP });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listC });
  const [form, setForm] = useState<FormState | null>(null);
  const [q, setQ] = useState("");

  const filtered = products.filter((p: any) =>
    !q || [p.name, p.brand, p.model].some((v) => (v ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  const saveMut = useMutation({
    mutationFn: async (f: FormState) => {
      let specs: any = {};
      try { specs = f.specifications ? JSON.parse(f.specifications) : {}; }
      catch { throw new Error("Specifications must be valid JSON"); }
      return save({
        data: {
          id: f.id, name: f.name, brand: f.brand, model: f.model,
          category_id: f.category_id, description: f.description,
          price: Number(f.price), quantity: Number(f.quantity),
          warranty: f.warranty, image_url: f.image_url || null,
          specifications: specs,
        } as any,
      });
    },
    onSuccess: () => {
      toast.success("Product saved");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setForm(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["products"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminShell title="Products">
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
          className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => setForm(empty)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="p-3">Product</th><th className="p-3">Brand</th>
              <th className="p-3">Category</th><th className="p-3">Price</th>
              <th className="p-3">Qty</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.model}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">{p.brand}</td>
                <td className="p-3">{p.categories?.name ?? "—"}</td>
                <td className="p-3">₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td className="p-3">
                  <span className={p.quantity === 0 ? "text-destructive" : p.quantity <= 6 ? "text-orange-600" : ""}>
                    {p.quantity}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setForm({
                    id: p.id, name: p.name, brand: p.brand ?? "", model: p.model ?? "",
                    category_id: p.category_id, description: p.description ?? "",
                    price: Number(p.price), quantity: p.quantity, warranty: p.warranty ?? "",
                    image_url: p.image_url ?? "",
                    specifications: JSON.stringify(p.specifications ?? {}, null, 2),
                  })} className="mr-2 rounded p-1.5 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Delete "${p.name}"?`) && delMut.mutate(p.id)}
                    className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setForm(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }}
            className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setForm(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
              <Field label="Brand"><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" /></Field>
              <Field label="Model"><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input" /></Field>
              <Field label="Category">
                <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className="input">
                  <option value="">— none —</option>
                  {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Price (₹) *"><input type="number" min={0} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input" /></Field>
              <Field label="Quantity *"><input type="number" min={0} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="input" /></Field>
              <Field label="Warranty"><input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} className="input" placeholder="e.g. 1 year" /></Field>
              <Field label="Image URL"><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input" placeholder="https://…" /></Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
              </Field>
              <Field label="Specifications (JSON)" className="sm:col-span-2">
                <textarea rows={4} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} className="input font-mono text-xs" />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saveMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {saveMut.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem;outline:none}`}</style>
    </AdminShell>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}