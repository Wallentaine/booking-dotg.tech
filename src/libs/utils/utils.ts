export function formatDateToString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

export function convertToYYYYMMDD(dateString) {
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('.').map(Number);

  const formattedDate = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;

  return formattedDate;
}

export function convertToDate(dateString: string) {
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1; // Месяцы начинаются с 0
  const day = parseInt(dateString.slice(6, 8), 10);

  return new Date(year, month, day);
}
