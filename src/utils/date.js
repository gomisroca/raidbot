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
  const ordinal = (n) => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return 'th';
    return { 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th';
  };

  return `${weekday}, ${day}${ordinal(day)} of ${month}`;
}
