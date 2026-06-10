import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '@/components/common/PagePlaceholder.jsx';

export function OrderDetailPage() {
  const { orderId } = useParams();

  return (
    <PagePlaceholder
      title="Detalle de pedido"
      description="Ruta dinamica para consultar o cobrar una orden especifica."
      backTo="/admin/pedidos"
    >
      <p className="text-sm text-copy">Parametro recibido: {orderId}</p>
    </PagePlaceholder>
  );
}
