import styles from "./MoneyCell.module.css";

export default function MoneyCell({ value, config = {} }) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  const currency = config.currency || "USD";

  return (
    <span className={styles.money}>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number)}
    </span>
  );
}
