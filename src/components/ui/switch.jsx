import { cn } from '@/lib/utils';

export function Switch({ checked = false, className, ...props }) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        'inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-neutral-300 p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:bg-neutral-950',
        className,
      )}
      data-state={checked ? 'checked' : 'unchecked'}
      role="switch"
      type="button"
      {...props}
    >
      <span
        className={cn(
          'block size-6 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
