const WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Ymd = { y: number; m: number; d: number };

function parse(iso: string): Ymd {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function toUtc({ y, m, d }: Ymd): number {
  return Date.UTC(y, m - 1, d);
}

/** Whole months between birth and a date; negative before the birth. */
export function monthsOld(birthDate: string, date: string): number {
  const b = parse(birthDate);
  const t = parse(date);
  const months = (t.y - b.y) * 12 + (t.m - b.m) - (t.d < b.d ? 1 : 0);
  return toUtc(t) < toUtc(b) ? -1 : months;
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** "5 days old", "6 weeks old", "4 months old", "1 year, 2 months old" */
export function ageLabel(birthDate: string, date: string): string {
  const days = Math.round(
    (toUtc(parse(date)) - toUtc(parse(birthDate))) / 86_400_000,
  );
  if (days < 0) return "before you arrived";
  if (days === 0) return "the day you were born";
  if (days < 14) return `${plural(days, "day")} old`;
  const months = monthsOld(birthDate, date);
  if (months < 3) return `${plural(Math.floor(days / 7), "week")} old`;
  if (months < 12) return `${plural(months, "month")} old`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0
    ? `${plural(years, "year")} old`
    : `${plural(years, "year")}, ${plural(rest, "month")} old`;
}

export type ChapterInfo = {
  /** Sort key; also stable across renders for anchors. */
  key: number;
  title: string;
  /** Short label for the index tabs. */
  tab: string;
};

/** Journals are read by age: one chapter per month for two years, then per year. */
export function chapterFor(birthDate: string, date: string): ChapterInfo {
  const months = monthsOld(birthDate, date);
  if (months < 0) return { key: -1, title: "Before you arrived", tab: "Bump" };
  if (months === 0) return { key: 0, title: "The first weeks", tab: "New" };
  if (months < 12) {
    return {
      key: months,
      title: `${WORDS[months]} month${months === 1 ? "" : "s"}`,
      tab: `${months} mo`,
    };
  }
  const years = Math.floor(months / 12);
  if (months >= 24) {
    return {
      key: years * 12,
      title: `${WORDS[years] ?? years} years`,
      tab: `${years} yr`,
    };
  }
  const rest = months % 12;
  return {
    key: months,
    title:
      rest === 0
        ? "One year"
        : `One year, ${WORDS[rest].toLowerCase()} month${rest === 1 ? "" : "s"}`,
    tab: rest === 0 ? "1 yr" : `1y ${rest}m`,
  };
}

/** "12 May 2026" */
export function longDate(iso: string): string {
  const { y, m, d } = parse(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "May 12", the face of a date card. */
export function cardDate(iso: string): string {
  const { m, d } = parse(iso);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
}

/** "May 2026" or "May to June 2026" for a run of dates. */
export function monthRange(dates: string[]): string {
  const sorted = [...dates].sort();
  const a = parse(sorted[0]);
  const b = parse(sorted[sorted.length - 1]);
  if (a.y === b.y && a.m === b.m) return `${MONTHS[a.m - 1]} ${a.y}`;
  if (a.y === b.y) return `${MONTHS[a.m - 1]} to ${MONTHS[b.m - 1]} ${a.y}`;
  return `${MONTHS[a.m - 1]} ${a.y} to ${MONTHS[b.m - 1]} ${b.y}`;
}
