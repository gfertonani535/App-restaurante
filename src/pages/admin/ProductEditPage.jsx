import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '@/components/common/PagePlaceholder.jsx';

export function ProductEditPage() {
  const { productId } = useParams();

  return (
    <PagePlaceholder
      title="Editar producto"
      description="Ruta dinamica del editor de producto identificada en el prototipo."
      backTo="/admin/productos"
    >
      <p className="text-sm text-copy">Parametro recibido: {productId}</p>
    </PagePlaceholder>
  );
}
