import { cn } from '@/lib/utils';

export function AdminPageContainer({ children, className }) {
  return <div className={cn('mx-auto w-full max-w-[1440px] space-y-8 px-4 py-6 sm:px-6 lg:px-8', className)}>{children}</div>;
}
