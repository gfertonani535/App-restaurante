import { NavLink } from 'react-router-dom';
import { BarChart3, HelpCircle, LayoutDashboard, LogOut, ReceiptText, Settings, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Cierre de Caja', to: '/admin/cierre-de-caja', icon: BarChart3 },
  { label: '\u00d3rdenes', to: '/admin/pedidos', icon: ReceiptText },
  { label: 'Productos', to: '/admin/productos', icon: Utensils },
  { label: 'Configuraci\u00f3n', to: '/admin/settings', icon: Settings },
];

export function BackofficeSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-neutral-200 bg-neutral-50 py-8 md:flex">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-black uppercase leading-none tracking-tight text-neutral-950">POS Backoffice</h1>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">Terminal v1.0.4</p>
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
        >
          <HelpCircle className="size-6" aria-hidden="true" />
          Ayuda
        </a>
        <a
          className="mx-2 flex min-h-12 items-center gap-3 px-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-neutral-950"
          href="#logout"
        >
          <LogOut className="size-6" aria-hidden="true" />
          {'Cerrar sesi\u00f3n'}
        </a>
      </div>
    </aside>
  );
}
