export const weekdayOptions = [
  { value: 1, label: 'Lunes', shortLabel: 'Lun' },
  { value: 2, label: 'Martes', shortLabel: 'Mar' },
  { value: 3, label: 'Miércoles', shortLabel: 'Mié' },
  { value: 4, label: 'Jueves', shortLabel: 'Jue' },
  { value: 5, label: 'Viernes', shortLabel: 'Vie' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' },
  { value: 7, label: 'Domingo', shortLabel: 'Dom' },
];

const weekdayShortLabels = Object.fromEntries(weekdayOptions.map((weekday) => [weekday.value, weekday.shortLabel]));

function formatBusinessHourTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

export function formatTimeRange(slot) {
  return `${formatBusinessHourTime(slot.opensAt)} - ${formatBusinessHourTime(slot.closesAt)}`;
}

export function groupBusinessHoursBySchedule(hours = []) {
  const byDay = new Map();

  for (const hour of hours) {
    const weekday = Number(hour.weekday);

    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
      continue;
    }

    const current = byDay.get(weekday) ?? {
      weekday,
      isClosed: false,
      slots: [],
    };

    if (hour.isClosed) {
      current.isClosed = true;
    } else if (hour.opensAt && hour.closesAt) {
      current.slots.push({
        opensAt: hour.opensAt,
        closesAt: hour.closesAt,
        slotNumber: Number(hour.slotNumber) || 1,
      });
    }

    byDay.set(weekday, current);
  }

  const groupedBySchedule = new Map();

  for (const day of byDay.values()) {
    const sortedSlots = day.slots.sort((first, second) => first.slotNumber - second.slotNumber);
    const isClosed = day.isClosed && sortedSlots.length === 0;
    const signature = isClosed
      ? 'closed'
      : sortedSlots.map((slot) => `${formatBusinessHourTime(slot.opensAt)}-${formatBusinessHourTime(slot.closesAt)}`).join('|');
    const key = signature || `empty-${day.weekday}`;
    const current = groupedBySchedule.get(key) ?? {
      key,
      weekdays: [],
      isClosed,
      slots: sortedSlots,
    };

    current.weekdays.push(day.weekday);
    groupedBySchedule.set(key, current);
  }

  return Array.from(groupedBySchedule.values())
    .map((group) => ({
      ...group,
      weekdays: group.weekdays.sort((first, second) => first - second),
    }))
    .sort((first, second) => first.weekdays[0] - second.weekdays[0]);
}

export function getBusinessHourGroupDayLabel(group) {
  return group.weekdays.map((weekday) => weekdayShortLabels[weekday] ?? weekday).join(', ');
}

export function formatBusinessHourGroup(group) {
  if (group.isClosed || group.slots.length === 0) {
    return 'Cerrado';
  }

  return group.slots.map(formatTimeRange).join(' / ');
}
