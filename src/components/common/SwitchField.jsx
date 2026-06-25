import { Switch } from '@/components/ui/switch.jsx';

export function SwitchField({ checked, description, disabled, label, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-950">{label}</p>
        {description ? <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p> : null}
      </div>
      <Switch checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)} />
    </div>
  );
}
