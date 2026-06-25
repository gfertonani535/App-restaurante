import { TableCell, TableRow } from '@/components/ui/table.jsx';

export function TableStateRow({ children, colSpan }) {
  return (
    <TableRow>
      <TableCell className="py-10 text-center text-neutral-500" colSpan={colSpan}>
        {children}
      </TableCell>
    </TableRow>
  );
}
