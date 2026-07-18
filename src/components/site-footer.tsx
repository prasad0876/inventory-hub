export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VoltMart. All rights reserved.</p>
          <p>Electronics inventory · Powered by Lovable Cloud</p>
        </div>
      </div>
    </footer>
  );
}