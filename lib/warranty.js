export function daysRemaining(expiryDate, now = new Date()) {
  if (!expiryDate) return 0;
  const zone = 'Asia/Kolkata';
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const localDay = (date) => fmt.format(new Date(date));
  const [ny, nm, nd] = localDay(now).split('-').map(Number);
  const [ey, em, ed] = localDay(expiryDate).split('-').map(Number);
  const todayUTC = Date.UTC(ny, nm - 1, nd);
  const expiryUTC = Date.UTC(ey, em - 1, ed);
  return Math.max(0, Math.ceil((expiryUTC - todayUTC) / 86400000));
}

export function warrantyStartsAt({ deliveredAt, installedAt, rule = 'delivery' }) {
  if (rule === 'installation' && installedAt) return new Date(installedAt);
  if (deliveredAt) return new Date(deliveredAt);
  if (rule === 'installation' && installedAt) return new Date(installedAt);
  return null;
}
