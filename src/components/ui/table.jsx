import { cn } from '@/lib/utils';

export function Table({ className, ...props }) {
  return <table className={cn('w-full caption-bottom border-collapse text-center text-sm', className)} {...props} />;
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableFooter({ className, ...props }) {
  return <tfoot className={cn('border-t bg-muted font-medium', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('border-b border-neutral-100 transition-colors hover:bg-neutral-50', className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={cn('h-12 px-6 text-center align-middle text-xs font-bold text-copy', className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-6 text-center py-4 align-middle', className)} {...props} />;
}

export function TableCaption({ className, ...props }) {
  return <caption className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
}
