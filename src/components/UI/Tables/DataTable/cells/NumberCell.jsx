import styles from "./NumberCell.module.css";

export default function NumberCell({ value }) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return (
    <span className={styles.number}>
      {Math.round(number).toLocaleString("en-US")}
      {/* {Math.round(number).toLocaleString("en-IN")} */}
    </span>
  );
}
