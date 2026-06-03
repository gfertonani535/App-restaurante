import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  default: Info,
  success: CheckCircle2,
  destructive: TriangleAlert,
};

export function Alert({ className, variant = 'default', title, children, ...props }) {
  const Icon = icons[variant] ?? Info;

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border bg-card p-4 text-sm',
        variant === 'success' && 'border-[#a4d9bc] bg-[#f0fbf5]',
        variant === 'destructive' && 'border-[#e8a8a3] bg-[#ffdad6]',
        className,
      )}
      role="status"
      {...props}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        {title ? <strong className="block font-bold leading-tight">{title}</strong> : null}
        <div className="mt-1 text-copy">{children}</div>
      </div>
    </div>
  );
}
