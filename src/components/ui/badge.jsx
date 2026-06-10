import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.08em]',
  {
    variants: {
      variant: {
        default: 'border-neutral-950 bg-neutral-950 text-white',
        secondary: 'border-transparent bg-neutral-100 text-neutral-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        destructive: 'border-red-200 bg-red-50 text-red-700',
        muted: 'border-neutral-200 bg-neutral-50 text-neutral-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
