import styles from "./DateCell.module.css";

export default function DateCell({ value }) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return <span className={styles.date}>{formattedDate}</span>;
}
