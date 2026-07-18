import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>✅</span>
          <span>Habit Tracker</span>
        </div>
        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-nav-link">
            Journal
          </Link>
          <Link href="/stats" className="sidebar-nav-link">
            Stats
          </Link>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
