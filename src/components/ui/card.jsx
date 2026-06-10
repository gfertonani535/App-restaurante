import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-md border bg-card text-card-foreground', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex min-h-13 items-center justify-between border-b px-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('m-0 text-lg font-semibold leading-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('m-0 text-sm leading-5 text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center border-t px-4 py-3', className)} {...props} />;
}
