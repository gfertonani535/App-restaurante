const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': {
    extension: 'jpg',
    label: 'JPG o JPEG',
  },
  'image/png': {
    extension: 'png',
    label: 'PNG',
  },
  'image/webp': {
    extension: 'webp',
    label: 'WebP',
  },
};

export function getImageTypeConfig(file) {
  return ALLOWED_IMAGE_TYPES[file?.type] ?? null;
}

export function getAllowedImageLabels() {
  return Object.values(ALLOWED_IMAGE_TYPES)
    .map((type) => type.label)
    .join(', ');
}

export function validateImageFile(file) {
  if (!file) {
    return '';
  }

  const imageType = getImageTypeConfig(file);

  if (!imageType) {
    return `Usá una imagen ${getAllowedImageLabels()}.`;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'La imagen no puede superar los 2 MB.';
  }

  return '';
}
