import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent px-6 text-xs font-bold uppercase leading-none tracking-[0.05em] transition-[background-color,border-color,color,transform] duration-150 hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-[#1c1b1b]',
        secondary: 'border-border bg-card text-primary hover:border-primary',
        ghost: 'bg-transparent px-2 text-primary hover:bg-muted',
      },
      size: {
        default: 'min-h-11 px-6',
        sm: 'min-h-9 px-4',
        icon: 'size-11 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
