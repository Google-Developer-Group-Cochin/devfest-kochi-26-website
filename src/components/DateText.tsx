// Renders a date label with the weekday in bold, e.g. "**Sunday**, 6 December 2026" or "**Sun** 6 Dec · 9:30 AM".
export default function DateText({ text }: { text: string }) {
  const [, day, rest] = text.match(/^([A-Za-z]+)([\s\S]*)$/) ?? [, "", text];
  return (
    <>
      {day && <strong className="font-bold text-ink">{day}</strong>}
      {rest}
    </>
  );
}
