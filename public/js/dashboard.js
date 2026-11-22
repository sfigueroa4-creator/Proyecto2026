export function weeklyHours(records, now = new Date(), weekCount = 12) {
  const currentWeek = new Date(now);
  currentWeek.setHours(0, 0, 0, 0);
  currentWeek.setDate(currentWeek.getDate() - (currentWeek.getDay() + 6) % 7);
  const firstWeek = new Date(currentWeek);
  firstWeek.setDate(firstWeek.getDate() - (weekCount - 1) * 7);
  const weeks = Array.from({ length: weekCount }, (_, index) => {
    const start = new Date(firstWeek);
    start.setDate(start.getDate() + index * 7);
    return { start, hours: 0 };
  });

  for (const record of records) {
    if (record.review_status === 'Rechazada' || !record.activity_date) continue;
    const date = new Date(`${String(record.activity_date).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.valueOf())) continue;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    const index = Math.round((date - firstWeek) / (7 * 24 * 60 * 60 * 1000));
    if (index >= 0 && index < weeks.length) weeks[index].hours += Number(record.hours) || 0;
  }

  return weeks.map(({ start, hours }, index) => ({
    label: `S${index + 1}`,
    weekOf: new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(start),
    hours
  }));
}
