import styles from "./ProfileCell.module.css";

export default function ProfileCell({ first_name, last_name, position }) {
  return (
    <div className={styles.profile}>
      <div className={styles.name}>
        {first_name} - <span className={styles.lastName}>{last_name.toUpperCase()}</span>
      </div>

      <div className={styles.position}>{position}</div>
    </div>
  );
}
