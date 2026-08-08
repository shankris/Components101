import styles from "./NameCell.module.css";

export default function NameCell({ first_name, last_name }) {
  return (
    <span className={styles.name}>
      {first_name} <span className={styles.lastName}>{last_name}</span>
    </span>
  );
}
