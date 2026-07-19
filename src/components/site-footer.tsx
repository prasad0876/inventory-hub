export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sai Srinivas Automobiles. All rights reserved.</p>
          <p>Automotive parts inventory · Powered by Lovable Cloud</p>
        </div>
      </div>
    </footer>
  );
}