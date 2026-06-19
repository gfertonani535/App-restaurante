import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, HelpCircle, LayoutDashboard, LogOut, ReceiptText, Settings, Tags, Utensils, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Cierre de Caja', to: '/admin/cierre-de-caja', icon: BarChart3 },
  { label: 'Órdenes', to: '/admin/pedidos', icon: ReceiptText },
  { label: 'Productos', to: '/admin/productos', icon: Utensils },
  { label: 'Categorías', to: '/admin/categorias', icon: Tags },
  { label: 'Configuración', to: '/admin/configuracion', icon: Settings },
];

export function BackofficeSidebar({ isOpen = true, onClose, onNavigate, variant = 'desktop' }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = variant === 'mobile';

  async function handleLogout() {
    onClose?.();
    await signOut();
    navigate('/login');
  }

  return (
    <aside
      aria-label="Menú del backoffice"
      className={cn(
        'flex flex-col border-r border-neutral-200 bg-neutral-50 py-8',
        isMobile
          ? 'absolute inset-y-0 left-0 z-10 w-72 max-w-[86vw] transition-transform duration-200 ease-out'
          : 'fixed inset-y-0 left-0 hidden w-64 md:flex',
        isMobile && (isOpen ? 'translate-x-0' : '-translate-x-full'),
      )}
    >
      <div className="mb-8 flex items-start justify-between gap-4 px-4">
        <div>
          <h1 className="text-xl font-black uppercase leading-none tracking-tight text-neutral-950">POS Backoffice</h1>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">Terminal v1.0.4</p>
        </div>
        {isMobile ? (
          <button
            aria-label="Cerrar menú"
            className="grid size-10 shrink-0 place-items-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Backoffice">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'mx-2 flex min-h-12 items-center gap-3 px-4 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors active:scale-[0.99]',
                  isActive ? 'bg-[#181818] text-white' : 'text-neutral-500 hover:text-neutral-950',
                )
              }
              key={item.to}
              onClick={onNavigate}
              to={item.to}
            >
              <Icon className="size-6" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-neutral-200 pt-4">
        <a
          className="mx-2 flex min-h-12 items-center gap-3 px-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-neutral-950"
          href="#help"
          onClick={onNavigate}
        >
          <HelpCircle className="size-6" aria-hidden="true" />
          Ayuda
        </a>
        <button
          className="mx-2 flex min-h-12 items-center gap-3 px-4 text-left text-[13px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-neutral-950"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="size-6" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
