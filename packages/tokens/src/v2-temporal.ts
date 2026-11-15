const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const fullMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export function parseDate(text: string): string | undefined {
  const trimmed = text.trim();
  let year: number, month: number, day: number;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const named =
    /^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+)?([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i.exec(
      trimmed,
    );
  if (iso) [, year, month, day] = iso.map(Number);
  else if (named) {
    year = Number(named[3]);
    month =
      months.findIndex(
        (m, i) =>
          m.toLowerCase() === named[1].toLowerCase() ||
          fullMonths[i].toLowerCase() === named[1].toLowerCase(),
      ) + 1;
    day = Number(named[2]);
  } else return undefined;
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31)
    return undefined;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : undefined;
}
export function dateObject(iso: string): Date {
  const valid = parseDate(iso);
  if (!valid) throw new RangeError('Expected a valid ISO date');
  const [y, m, d] = valid.split('-').map(Number),
    date = new Date(0);
  date.setUTCFullYear(y, m - 1, d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
export function dateISO(date: Date): string {
  if (date.getUTCFullYear() < 1) return '0001-01-01';
  if (date.getUTCFullYear() > 9999) return '9999-12-31';
  return date.toISOString().slice(0, 10);
}
export function localDateISO(date = new Date()): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(iso: string, days: number): string {
  const date = dateObject(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return dateISO(date);
}
export function addMonths(iso: string, months: number): string {
  const date = dateObject(iso),
    day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const year = date.getUTCFullYear(),
    month = date.getUTCMonth();
  date.setUTCMonth(month + 1, 0);
  const last = date.getUTCDate();
  date.setUTCFullYear(year, month, Math.min(day, last));
  return dateISO(date);
}
export function formatDate(iso: string | undefined): string {
  return iso && parseDate(iso)
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(dateObject(iso))
    : '';
}
export function monthGrid(iso: string, firstDay = 1): string[] {
  const date = dateObject(iso);
  date.setUTCDate(1);
  const first = dateISO(date),
    offset = (date.getUTCDay() - firstDay + 7) % 7;
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  const count = Math.ceil((offset + date.getUTCDate()) / 7) * 7;
  return Array.from({ length: count }, (_, i) => {
    const day = dateObject(first);
    day.setUTCDate(day.getUTCDate() + i - offset);
    return day.getUTCFullYear() < 1 || day.getUTCFullYear() > 9999
      ? ''
      : dateISO(day);
  });
}
export function parseTime(text: string): string | undefined {
  const match = /^(\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(text.trim());
  if (!match) return undefined;
  let hour = Number(match[1]);
  const minute = Number(match[2]),
    period = match[3]?.toUpperCase();
  if (minute > 59 || (period ? hour < 1 || hour > 12 : hour > 23))
    return undefined;
  if (period) hour = (hour % 12) + (period === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
export function formatTime(value: string | undefined): string {
  const time = value && parseTime(value);
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
export const quarterHours = Object.freeze(
  Array.from(
    { length: 96 },
    (_, i) =>
      `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
  ),
);
