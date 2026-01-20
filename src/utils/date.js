export function formatFriendlyDate(date) {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const monthNames = [
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
  const weekday = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const ordinal = (n) =>
    n > 3 && n < 21 ? `${n}th` : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
  return `${weekday}, ${day}${ordinal(day)} of ${month}`;
}
