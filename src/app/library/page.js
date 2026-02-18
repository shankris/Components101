import Link from "next/link";
import compList from "@/data/components.json";
import styles from "./page.module.css";

export default function LibraryPage() {
  return (
    <ul className={styles.grid}>
      {compList.map((item) => (
        <li
          key={item.slug}
          className={styles.compListItem}
        >
          <Link href={`/library/${item.slug}`}>
            <h3>{item.name}</h3>
          </Link>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
