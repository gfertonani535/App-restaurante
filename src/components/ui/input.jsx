import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex min-h-11 w-full rounded-md border border-input bg-card px-4 text-base text-foreground transition-colors placeholder:text-muted-foreground hover:border-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
