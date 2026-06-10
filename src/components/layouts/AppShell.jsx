import { BottomNavigation } from '@/components/navbar/BottomNavigation.jsx';
import { TopAppBar } from '@/components/navbar/TopAppBar.jsx';

export function AppShell({ children, showBottomNavigation = true }) {
  return (
    <div className="min-h-[max(884px,100dvh)]">
      <TopAppBar />
      <main className={`mx-auto max-w-3xl px-4 pt-24 ${showBottomNavigation ? 'pb-24' : 'pb-0'}`} aria-labelledby="menu-heading">
        {children}
      </main>
      {showBottomNavigation ? <BottomNavigation /> : null}
    </div>
  );
}
