import { cn } from '@/lib/utils';

export function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <div
      className={cn(orientation === 'vertical' ? 'h-full w-px bg-border' : 'h-px w-full bg-border', className)}
      role="separator"
      {...props}
    />
  );
}
