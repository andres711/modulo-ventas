export function toYmd(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateTimeAr(value) {
  if (!value) return "";

  const [date, time] = String(value).split(" ");
  if (!date || !time) return String(value);

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time}`;
}
