export function money(value: number, digits = 0) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: digits }).format(value);
}

export function number(value: number) {
  return new Intl.NumberFormat("es-ES").format(Math.round(value));
}

export function pct(value: number) {
  return `${value.toFixed(1).replace(".0", "")}%`;
}

export function relativeDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
