import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopAppBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-surface-high bg-card px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Abrir menu" className="size-7 p-0 hover:bg-transparent">
          <Menu className="size-6" aria-hidden="true" />
        </Button>
        <p className="m-0 text-lg font-bold leading-none tracking-normal text-foreground">Bistro Digital</p>
      </div>
    </header>
  );
}
