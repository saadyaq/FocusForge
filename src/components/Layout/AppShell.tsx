import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { FocusForgeLogo } from "../Brand/FocusForgeLogo";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}

interface AppShellProps {
  children: ReactNode;
  navItems: NavItem[];
  onNavigate: (id: string) => void;
}

export function AppShell({ children, navItems, onNavigate }: AppShellProps) {
  return (
    <div className="min-h-screen bg-forge-paper text-forge-ink antialiased dark:bg-[#111210] dark:text-[#f5f1e8]">
      <div className="flex min-h-screen">
        <aside className="hidden w-20 shrink-0 border-r border-forge-line/80 bg-white/70 px-3 py-5 dark:border-white/10 dark:bg-white/[0.03] md:block">
          <FocusForgeLogo showWordmark={false} className="mb-8" />

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
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <item.icon size={19} strokeWidth={2} />
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between px-5 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <FocusForgeLogo className="shrink-0" />
              <div className="hidden min-w-0 sm:block">
                <h1 className="text-2xl font-semibold tracking-normal">Build better focus</h1>
              </div>
            </div>
            <div className="rounded-lg border border-forge-line bg-white px-3 py-2 text-sm text-[#6f6b60] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#bbb4a6]">
              Desktop MVP
            </div>
          </header>

          <nav className="mx-5 mb-4 flex rounded-lg border border-forge-line bg-white p-1 dark:border-white/10 dark:bg-white/[0.04] md:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                  item.active
                    ? "bg-forge-accent text-white"
                    : "text-[#6f6b60] hover:bg-forge-paper hover:text-forge-ink dark:text-[#a9a398] dark:hover:bg-white/10 dark:hover:text-white"
                }`}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
}
