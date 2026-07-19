import { Link } from "@tanstack/react-router";
import { Cpu, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function SiteHeader() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-4 w-4" />
          </span>
          <span>Sai Srinivas Automobiles</span>
        </Link>
        <form
          className="ml-4 hidden flex-1 items-center gap-2 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/products", search: { q } as any });
          }}
        >
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search laptops, mobiles, SSDs…"
              className="w-full rounded-full border border-border bg-secondary/60 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background"
            />
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground [&.active]:text-foreground">Home</Link>
          <Link to="/products" className="hover:text-foreground [&.active]:text-foreground">Products</Link>
        </nav>
      </div>
    </header>
  );
}