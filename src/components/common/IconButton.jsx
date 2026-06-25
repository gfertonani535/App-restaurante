import { cn } from '@/lib/utils';

export function IconButton({ children, className, label, ...props }) {
  return (
    <button
      aria-label={label}
      className={cn(
        'grid size-10 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
