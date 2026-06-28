import { ImageIcon } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { getCategoryImageUrl } from '@/services/categories.service.js';
import { cn } from '@/lib/utils';

export function CategoryStatus({ isActive }) {
  return <StatusBadge dot label={isActive ? 'Activa' : 'Inactiva'} variant={isActive ? 'success' : 'muted'} />;
}

export function CategoryThumbnail({ imagePath, name, previewUrl = '', size = 'sm' }) {
  const imageSrc = previewUrl || getCategoryImageUrl(imagePath);

  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden border border-neutral-200 bg-neutral-100 text-neutral-400',
        size === 'lg' ? 'size-24' : 'size-12',
      )}
    >
      {imageSrc ? (
        <img className="size-full object-cover" src={imageSrc} alt={`Foto de ${name || 'categoría'}`} />
      ) : (
        <ImageIcon className={cn(size === 'lg' ? 'size-9' : 'size-5')} strokeWidth={1.8} aria-hidden="true" />
      )}
    </div>
  );
}
