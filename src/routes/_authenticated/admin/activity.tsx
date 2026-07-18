import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin-shell";
import { listActivity } from "@/lib/products.functions";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const list = useServerFn(listActivity);
  const { data = [] } = useQuery({ queryKey: ["activity"], queryFn: list });
  return (
    <AdminShell title="Activity Log">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr><th className="p-3">When</th><th className="p-3">Admin</th><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Details</th></tr>
          </thead>
          <tbody>
            {data.map((l: any) => (
              <tr key={l.id} className="border-t border-border align-top">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-3">{l.admin_email || l.admin_id.slice(0, 8)}</td>
                <td className="p-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{l.action}</span></td>
                <td className="p-3">{l.entity}</td>
                <td className="p-3 text-xs text-muted-foreground">{l.meta ? JSON.stringify(l.meta) : ""}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No activity yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}