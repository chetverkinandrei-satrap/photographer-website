const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const WEEKDAYS = [
  'воскресенье', 'понедельник', 'вторник', 'среда',
  'четверг', 'пятница', 'суббота'
];

/**
 * Converts "2026-03-26" to "26 марта, четверг"
 */
export function formatDatePretty(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const d = date.getDate();
  const m = MONTHS[date.getMonth()];
  const w = WEEKDAYS[date.getDay()];
  return `${d} ${m}, ${w}`;
}
