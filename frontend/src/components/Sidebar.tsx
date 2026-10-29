import { LayoutDashboard, ListChecks, SquareCheck } from 'lucide-react';

import type { ViewName } from '../types';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
] as const;

interface NavProps {
  view: ViewName;
  onViewChange(view: ViewName): void;
  taskCount: number | null;
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-lg bg-ink text-white"
      >
        <SquareCheck size={18} strokeWidth={2.25} />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">Task manager</span>
    </div>
  );
}

function CountChip({ count, active }: { count: number | null; active: boolean }) {
  if (count === null) {
    return null;
  }
  return (
    <span
      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        active ? 'bg-white/20 text-white' : 'bg-ink/10 text-ink/70'
      }`}
    >
      {count}
    </span>
  );
}

/** Vertical share of the app: brand, page switcher. */
export default function Sidebar({ view, onViewChange, taskCount }: NavProps) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-ink/10 bg-white md:flex">
      <div className="px-5 pt-6">
        <Brand />
      </div>
      <nav aria-label="Main" className="mt-7 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = view === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onViewChange(item.key)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border-none px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                active ? 'bg-ink text-white' : 'bg-transparent text-ink/75 hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Icon size={17} aria-hidden />
              {item.label}
              {item.key === 'tasks' && <CountChip count={taskCount} active={active} />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/** Same navigation, compact for small screens. */
export function TopNav({ view, onViewChange, taskCount }: NavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/90 px-5 py-3 backdrop-blur md:hidden">
      <Brand />
      <nav aria-label="Main" className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-paper p-1">
        {NAV_ITEMS.map((item) => {
          const active = view === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onViewChange(item.key)}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border-none px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                active ? 'bg-white text-ink shadow-sm' : 'bg-transparent text-ink/65 hover:text-ink'
              }`}
            >
              <Icon size={16} aria-hidden />
              {item.label}
              {item.key === 'tasks' && taskCount !== null && (
                <span className="rounded-full bg-ink/10 px-1.5 py-0.5 text-[11px] tabular-nums">
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
