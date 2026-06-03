import { BottomNavigation } from '@/components/navbar/BottomNavigation.jsx';
import { TopAppBar } from '@/components/navbar/TopAppBar.jsx';

export function AppShell({ children }) {
  return (
    <div className="min-h-[max(884px,100dvh)]">
      <TopAppBar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-24" aria-labelledby="menu-heading">
        {children}
      </main>
      {/* <BottomNavigation /> */}
    </div>
  );
}
