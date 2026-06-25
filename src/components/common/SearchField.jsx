import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { cn } from '@/lib/utils';

export function SearchField({
  className,
  disabled,
  iconClassName,
  inputClassName,
  label,
  onChange,
  placeholder,
  value,
}) {
  const accessibleLabel = label ?? placeholder ?? 'Buscar';

  return (
    <label className={cn('relative block w-full', className)}>
      <Search
        className={cn('absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400', iconClassName)}
        aria-hidden="true"
      />
      <Input
        aria-label={accessibleLabel}
        className={cn('h-10 min-h-10 rounded-none border-neutral-200 bg-white pl-10 text-sm', inputClassName)}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
