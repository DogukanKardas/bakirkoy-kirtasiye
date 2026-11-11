import type { Hours, HoursException } from "@db/queries";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const DAY_LABELS: Record<string, string> = {
  mon: "Pzt",
  tue: "Sal",
  wed: "Çar",
  thu: "Per",
  fri: "Cum",
  sat: "Cmt",
  sun: "Paz",
};

/** Haftalık saat listesini Pazartesi'den başlatarak döner. */
export const DAYS_ORDER = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export function getOpenState(
  hours: Hours,
  exceptions: HoursException[] = [],
): {
  open: boolean;
  todayLabel: string;
} {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const current = `${hour}:${minute}`;

  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const isoDate = `${y}-${m}-${d}`;

  // tarih bazli istisnalar (bayram, ozel gun vb.) haftalik programi ezer
  const exception = exceptions.find((e) => e.date === isoDate);
  if (exception) {
    if (exception.closed || !exception.open || !exception.close) {
      return {
        open: false,
        todayLabel: exception.label
          ? `${exception.label} — kapalı`
          : "Bugün kapalı",
      };
    }
    return {
      open: current >= exception.open && current < exception.close,
      todayLabel: `${exception.label ? exception.label + " — " : ""}${exception.open}–${exception.close}`,
    };
  }

  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );
  const key = DAY_KEYS[dayIndex] ?? "mon";
  const today = hours[key];

  if (!today) {
    return { open: false, todayLabel: "Bugün kapalı" };
  }

  const open = current >= today.open && current < today.close;
  return {
    open,
    todayLabel: `${DAY_LABELS[key]} ${today.open}–${today.close}`,
  };
}

export function hoursSummary(hours: Hours): string {
  const order: Array<keyof typeof DAY_LABELS> = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ];
  return order
    .map((k) => {
      const h = hours[k];
      if (!h) return `${DAY_LABELS[k]} kapalı`;
      return `${DAY_LABELS[k]} ${h.open}–${h.close}`;
    })
    .join(" · ");
}
