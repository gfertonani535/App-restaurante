import { cn } from '@/lib/utils';

const variants = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

export function FeedbackMessage({ children, className, variant = 'error' }) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn('border p-3 text-sm font-semibold', variants[variant] ?? variants.error, className)}>
      {children}
    </p>
  );
}
