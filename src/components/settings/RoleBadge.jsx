import { Badge } from '@/components/ui/badge.jsx';
import { roleByValue } from '@/components/settings/settings.constants.js';

export function RoleBadge({ role }) {
  const meta = roleByValue[role] ?? roleByValue.staff;

  return <Badge variant="secondary">{meta.label}</Badge>;
}
