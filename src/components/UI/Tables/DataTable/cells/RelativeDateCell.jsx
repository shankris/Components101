import styles from "./RelativeDateCell.module.css";

export default function RelativeDateCell({ value }) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();

  const diffMs = date.getTime() - now.getTime();

  const day = 1000 * 60 * 60 * 24;
  const days = Math.round(diffMs / day);

  let valueToFormat;
  let unit;

  if (Math.abs(days) >= 365) {
    valueToFormat = Math.round(days / 365);
    unit = "year";
  } else if (Math.abs(days) >= 30) {
    valueToFormat = Math.round(days / 30);
    unit = "month";
  } else if (Math.abs(days) >= 7) {
    valueToFormat = Math.round(days / 7);
    unit = "week";
  } else {
    valueToFormat = days;
    unit = "day";
  }

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "always",
  });

  let text = formatter.format(valueToFormat, unit);

  // Make "1 year ago" → "one year ago"
  if (valueToFormat === -1) {
    text = text.replace(/^1 /, "one ");
  }

  return <span className={styles.relativeDate}>{text}</span>;
}
