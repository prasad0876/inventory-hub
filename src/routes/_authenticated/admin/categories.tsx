import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listCategories, upsertCategory, deleteCategory } from "@/lib/products.functions";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const list = useServerFn(listCategories);
  const save = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const { data = [] } = useQuery({ queryKey: ["categories"], queryFn: list });
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: { id?: string; name: string }) => save({ data: v }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["categories"] }); setName(""); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["categories"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminShell title="Categories">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {data.map((c: any) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing({ id: c.id, name: c.name })} className="mr-2 rounded p-1.5 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => confirm(`Delete "${c.name}"?`) && delMut.mutate(c.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editing) saveMut.mutate({ id: editing.id, name: editing.name });
            else if (name.trim()) saveMut.mutate({ name: name.trim() });
          }}
          className="rounded-2xl border border-border bg-card p-5 h-max"
        >
          <h2 className="mb-3 font-semibold">{editing ? "Edit category" : "New category"}</h2>
          <input
            value={editing ? editing.name : name}
            onChange={(e) => editing ? setEditing({ ...editing, name: e.target.value }) : setName(e.target.value)}
            placeholder="Category name"
            className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
            )}
            <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}