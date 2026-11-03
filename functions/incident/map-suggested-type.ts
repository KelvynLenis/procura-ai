export function mapSuggestedTypeToOccurrenceType(
  suggestedType?: string | null,
): string {
  const normalized = (suggestedType || "").trim().toLowerCase();

  if (normalized.includes("roubo")) return "Roubo";
  if (normalized.includes("perda") || normalized.includes("extravio")) {
    return "Extravio ou Perda";
  }
  if (normalized.includes("furto")) return "Furto simples";

  return "";
}

export function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    // Aceita formatos já legíveis do mobile (ex: "03/11/2026 - 10:15")
    const brMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})$/,
    );
    if (!brMatch) return "";

    const [, day, month, year, hour, minute] = brMatch;
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
