import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Package, PackageX, Layers, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { dashboardStats, checkIsAdmin } from "@/lib/products.functions";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Kpi({ icon: Icon, label, value, tone = "primary" }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <span className={`grid h-9 w-9 place-items-center rounded-lg bg-${tone}/10 text-${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function Dashboard() {
  const check = useServerFn(checkIsAdmin);
  const stats = useServerFn(dashboardStats);
  const { data: adminCheck } = useQuery({ queryKey: ["is-admin"], queryFn: check });
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: stats,
    enabled: !!adminCheck?.isAdmin,
  });

  if (adminCheck && !adminCheck.isAdmin) {
    return (
      <AdminShell title="Access denied">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
          Your account isn't an admin. Ask an owner to grant the admin role.
        </div>
      </AdminShell>
    );
  }

  const COLORS = ["#2563eb", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

  return (
    <AdminShell title="Dashboard">
      {isLoading || !data ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Package} label="Total products" value={data.totalProducts} />
            <Kpi icon={TrendingUp} label="In stock" value={data.inStock} />
            <Kpi icon={PackageX} label="Out of stock" value={data.outOfStock} />
            <Kpi icon={Layers} label="Categories" value={data.categories} />
            <Kpi icon={Wallet} label="Total pending ₹" value={`₹${data.totalDue.toLocaleString("en-IN")}`} />
            <Kpi icon={AlertTriangle} label="Overdue" value={data.overdue} />
            <Kpi icon={Wallet} label="Pending customers" value={data.pendingCustomers} />
            <Kpi icon={Wallet} label="Paid customers" value={data.paidCustomers} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 font-semibold">Stock by category</div>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={data.byCategory}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 font-semibold">Stock distribution</div>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="qty" nameKey="name" outerRadius={100}>
                      {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}