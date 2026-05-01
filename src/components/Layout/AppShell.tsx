import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  active: boolean;
}

interface AppShellProps {
  children: ReactNode;
  navItems: NavItem[];
}

export function AppShell({ children, navItems }: AppShellProps) {
  return (
    <div className="min-h-screen bg-forge-paper text-forge-ink antialiased dark:bg-[#111210] dark:text-[#f5f1e8]">
      <div className="flex min-h-screen">
        <aside className="hidden w-20 shrink-0 border-r border-forge-line/80 bg-white/70 px-3 py-5 dark:border-white/10 dark:bg-white/[0.03] md:block">
          <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg bg-forge-ink text-sm font-semibold text-white dark:bg-[#f5f1e8] dark:text-[#141412]">
            FF
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`grid h-11 w-11 place-items-center rounded-lg transition ${
                  item.active
                    ? "bg-forge-accent text-white shadow-soft"
                    : "text-[#6f6b60] hover:bg-black/5 hover:text-forge-ink dark:text-[#a9a398] dark:hover:bg-white/10 dark:hover:text-white"
                }`}
                title={item.label}
                type="button"
              >
                <item.icon size={19} strokeWidth={2} />
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forge-accent">FocusForge</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">Build better focus</h1>
            </div>
            <div className="rounded-lg border border-forge-line bg-white px-3 py-2 text-sm text-[#6f6b60] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#bbb4a6]">
              Desktop MVP
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
