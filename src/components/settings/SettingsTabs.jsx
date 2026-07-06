import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils';
import { settingsTabs } from '@/components/settings/settings.constants.js';

export function SettingsTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-8 border-b border-neutral-200" role="tablist" aria-label="Secciones de configuración">
      {settingsTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <Button
            aria-selected={isActive}
            className={cn(
              'min-h-11 rounded-none border-x-0 border-t-0 border-b-2 bg-transparent px-1 text-sm font-semibold normal-case tracking-normal shadow-none hover:bg-transparent',
              isActive
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-950',
            )}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            size="sm"
            type="button"
            variant="ghost"
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
