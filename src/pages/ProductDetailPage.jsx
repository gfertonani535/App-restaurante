import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '@/components/common/PagePlaceholder.jsx';
import { AppShell } from '@/components/layouts/AppShell.jsx';

export function ProductDetailPage() {
  const { productId } = useParams();

  return (
    <AppShell>
      <PagePlaceholder
        title="Detalle de producto"
        description="Ruta dinámica preparada para consumir datos por identificador."
        backTo="/menu"
      >
        <p className="text-sm text-copy">Parámetro recibido: {productId}</p>
      </PagePlaceholder>
    </AppShell>
  );
}
