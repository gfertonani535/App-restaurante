import { UserRound, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'menu', label: 'Menu', icon: Utensils, active: true },
  { id: 'account', label: 'Account', icon: UserRound, active: false },
];

export function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-surface-high bg-card"
      aria-label="Navegacion principal"
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={item.active ? 'page' : undefined}
            className={cn(
              'flex h-full min-w-16 flex-col items-center justify-center border-t-4 border-transparent px-0 pb-4 pt-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
              item.active ? 'border-primary text-primary' : 'text-[#9b9b9b] hover:bg-surface-low hover:text-copy',
            )}
          >
            <Icon className="size-6" strokeWidth={item.active ? 2.4 : 2} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase leading-none tracking-normal">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
