import { NavLink, Outlet } from 'react-router-dom';
import { Bell, ShoppingBasket, UserRound } from 'lucide-react';
import { BackofficeSidebar } from '@/components/backoffice/BackofficeSidebar.jsx';

export function AdminLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackofficeSidebar />

      <div className="min-w-0 md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-none text-neutral-950 sm:text-xl">Backoffice</p>
            <p className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 sm:block">
              RestaurantOS
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink
              className="inline-flex min-h-10 items-center gap-2 border border-neutral-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-950 transition-colors hover:border-neutral-950 sm:px-4"
              to="/menu"
            >
              <ShoppingBasket className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{'Ver men\u00fa'}</span>
            </NavLink>
            <button className="grid size-10 place-items-center text-neutral-500 transition-colors hover:bg-neutral-50" type="button">
              <Bell className="size-5" aria-hidden="true" />
            </button>
            <UserRound className="hidden size-5 text-neutral-400 sm:block" aria-hidden="true" />
          </div>
        </header>

        <main className="min-h-[calc(100dvh-4rem)] bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
