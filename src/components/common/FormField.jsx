import { FieldError } from '@/components/common/FieldError.jsx';
import { Label } from '@/components/ui/label.jsx';
import { cn } from '@/lib/utils';

export function FormField({ children, className, error, htmlFor, label }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
