import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";
import componentList from "@/data/components.json";

export default function Home() {
  return (
    <div>
      <h1>Components</h1>

      <ul className={styles.grid}>
        {componentList.map((item) => (
          <li
            className={styles.compListItem}
            key={item.slug}
          >
            <Link href={`/library/${item.slug}`}>
              <h3>{item.name}</h3>
            </Link>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
