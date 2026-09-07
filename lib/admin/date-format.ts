type AdminDateValue = string | null | undefined;

export function formatAdminDateValue(value: AdminDateValue, options: Intl.DateTimeFormatOptions) {
  if (!value) return "-";

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", options).format(date);
}
