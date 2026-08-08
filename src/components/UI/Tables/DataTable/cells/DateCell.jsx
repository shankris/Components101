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
    dateStyle: "long",
  }).format(date);

  return <span className={styles.date}>{formattedDate}</span>;
}
