import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listDues, upsertDue, deleteDue, markDuePaid } from "@/lib/products.functions";

export const Route = createFileRoute("/_authenticated/admin/dues")({
  component: DuesPage,
});

type F = { id?: string; customer_name: string; phone: string; product_name: string; amount: number; due_date: string; status: "pending" | "paid" | "overdue"; notes: string; };
const empty: F = { customer_name: "", phone: "", product_name: "", amount: 0, due_date: "", status: "pending", notes: "" };

function DuesPage() {
  const qc = useQueryClient();
  const list = useServerFn(listDues);
  const save = useServerFn(upsertDue);
  const del = useServerFn(deleteDue);
  const paid = useServerFn(markDuePaid);
  const { data = [] } = useQuery({ queryKey: ["dues"], queryFn: list });
  const [form, setForm] = useState<F | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");

  const rows = data.filter((d: any) => {
    if (filter === "all") return true;
    if (filter === "overdue") return d.status !== "paid" && d.due_date && new Date(d.due_date) < new Date();
    return d.status === filter;
  });

  const saveMut = useMutation({
    mutationFn: (f: F) => save({ data: { ...f, due_date: f.due_date || null, amount: Number(f.amount) } as any }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["dues"] }); setForm(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["dues"] }); } });
  const paidMut = useMutation({ mutationFn: (id: string) => paid({ data: { id } }), onSuccess: () => { toast.success("Marked paid"); qc.invalidateQueries({ queryKey: ["dues"] }); } });

  return (
    <AdminShell title="Pending Dues">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "pending", "overdue", "paid"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>{f}</button>
          ))}
        </div>
        <button onClick={() => setForm(empty)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> New due
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr><th className="p-3">Customer</th><th className="p-3">Product</th><th className="p-3">Amount</th><th className="p-3">Due</th><th className="p-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((d: any) => {
              const overdue = d.status !== "paid" && d.due_date && new Date(d.due_date) < new Date();
              return (
                <tr key={d.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-medium">{d.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{d.phone}</div>
                  </td>
                  <td className="p-3">{d.product_name || "—"}</td>
                  <td className="p-3 font-semibold">₹{Number(d.amount).toLocaleString("en-IN")}</td>
                  <td className="p-3">{d.due_date ? new Date(d.due_date).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === "paid" ? "bg-green-100 text-green-800"
                      : overdue ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                    }`}>{d.status === "paid" ? "Paid" : overdue ? "Overdue" : "Pending"}</span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {d.status !== "paid" && (
                      <button onClick={() => paidMut.mutate(d.id)} className="mr-1 rounded p-1.5 text-green-700 hover:bg-green-100"><Check className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => setForm({
                      id: d.id, customer_name: d.customer_name, phone: d.phone ?? "",
                      product_name: d.product_name ?? "", amount: Number(d.amount),
                      due_date: d.due_date ?? "", status: d.status, notes: d.notes ?? "",
                    })} className="mr-1 rounded p-1.5 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => confirm("Delete this record?") && delMut.mutate(d.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No records.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setForm(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }}
            className="w-full max-w-xl rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? "Edit due" : "New due"}</h2>
              <button type="button" onClick={() => setForm(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <L label="Customer name *"><input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="ip" /></L>
              <L label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="ip" /></L>
              <L label="Product"><input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className="ip" /></L>
              <L label="Amount (₹) *"><input type="number" min={0} step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="ip" /></L>
              <L label="Due date"><input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="ip" /></L>
              <L label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="ip">
                  <option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
                </select>
              </L>
              <L label="Notes" className="sm:col-span-2"><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="ip" /></L>
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
      <style>{`.ip{width:100%;border:1px solid var(--border);background:var(--background);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem;outline:none}`}</style>
    </AdminShell>
  );
}
function L({ label, children, className = "" }: any) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>{children}</label>;
}