import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, ShoppingBasket, UserRound } from 'lucide-react';
import { BackofficeSidebar } from '@/components/backoffice/BackofficeSidebar.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeMobileSidebar();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackofficeSidebar />
      <div
        aria-hidden={!isMobileSidebarOpen}
        className={cn(
          'fixed inset-0 z-40 md:hidden',
          isMobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        inert={isMobileSidebarOpen ? undefined : ''}
      >
        <button
          aria-label="Cerrar menú"
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out',
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={closeMobileSidebar}
          type="button"
        />
        <BackofficeSidebar
          isOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
          onNavigate={closeMobileSidebar}
          variant="mobile"
        />
      </div>

      <div className="min-w-0 md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Abrir menú"
              className="grid size-10 shrink-0 place-items-center text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950 md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
              type="button"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-none text-neutral-950 sm:text-xl">Backoffice</p>
              <p className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 sm:block">
                RestaurantOS
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <NavLink
              className="inline-flex size-10 min-h-10 items-center justify-center gap-2 border border-neutral-200 bg-white px-0 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-950 transition-colors hover:border-neutral-950 sm:size-auto sm:px-4"
              to="/menu"
            >
              <ShoppingBasket className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Ver menú</span>
            </NavLink>
            <button className="hidden size-10 place-items-center text-neutral-500 transition-colors hover:bg-neutral-50 sm:grid" type="button">
              <Bell className="size-5" aria-hidden="true" />
            </button>
            <UserRound className="hidden size-5 text-neutral-400 sm:block" aria-hidden="true" />
            <button
              onClick={handleLogout}
              className="hidden size-10 place-items-center text-neutral-500 transition-colors hover:bg-neutral-50 sm:grid"
              type="button"
              title="Cerrar sesión"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100dvh-4rem)] bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
