import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '@/components/common/PagePlaceholder.jsx';

export function OrderDetailPage() {
  const { orderId } = useParams();

  return (
    <PagePlaceholder
      title="Detalle de pedido"
      description="Ruta dinámica para consultar o cobrar una orden específica."
      backTo="/admin/pedidos"
    >
      <p className="text-sm text-copy">Parámetro recibido: {orderId}</p>
    </PagePlaceholder>
  );
}
