export function createEmptyBusinessHourForm() {
  return {
    selectedWeekdays: ['1'],
    isClosed: false,
    slots: [{ opensAt: '09:00', closesAt: '18:00' }],
  };
}

export function getNextSocialOrder(links) {
  const maxOrder = links.reduce((maxOrderValue, link) => Math.max(maxOrderValue, Number(link.displayOrder) || 0), 0);
  return String(maxOrder + 1);
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
