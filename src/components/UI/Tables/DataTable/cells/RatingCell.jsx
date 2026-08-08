import styles from "./RatingCell.module.css";

export default function RatingCell({ value, config = {} }) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  const max = Number(config.max) || 10;

  // Keep the rating within the valid range
  const rating = Math.min(Math.max(number, 0), max);

  // 1/10 = 10%, 5/10 = 50%, 10/10 = 100%
  const percentage = (rating / max) * 100;

  return (
    <div className={styles.rating}>
      <div className={styles.barContainer}>
        <div
          className={styles.bar}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className={styles.value}>
        {number}/{max}
      </span>
    </div>
  );
}
