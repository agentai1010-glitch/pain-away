import { Outlet, Link } from "react-router-dom";

/**
 * Root layout wrapping all pages.
 * Provides consistent header, main content area, and footer.
 */
function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary tracking-tight">
              Pain Away
            </span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Link to="/book" className="text-sm font-medium hover:text-primary transition-colors">
              Book Appointment
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 container py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Pain Away — Physical Therapy Clinic, Pune
        </div>
      </footer>
    </div>
  );
}

export default RootLayout;
