import Link from "next/link";

import styles from "./page.module.css";

import componentList from "@/data/components.json";

export default function Home() {
  const groupedComponents = componentList.reduce((acc, item) => {
    const category = item.category || "Other";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(item);

    return acc;
  }, {});

  return (
    <div className={styles.block}>
      <h1>Components</h1>

      <ul className={styles.grid}>
        {Object.entries(groupedComponents).map(([category, items]) => (
          <li
            key={category}
            className={`${styles.compListItem} ripple`}
          >
            <Link
              href={`/library/category/${category}`}
              className={styles.cardLink}
            >
              <div className={styles.cardTop}>
                <h2>{category}</h2>

                <span className={styles.count}>{items.length}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
