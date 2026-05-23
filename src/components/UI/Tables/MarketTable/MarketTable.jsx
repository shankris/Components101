"use client";

import { useMemo, useState } from "react";
import styles from "./MarketTable.module.css";

export default function MarketTable({ title, periods, defaultPeriod, dataByPeriod, initialSort }) {
  const [activePeriod, setActivePeriod] = useState(defaultPeriod);
  const [sort, setSort] = useState(initialSort);

  const data = dataByPeriod[activePeriod] || [];

  const sortedData = useMemo(() => {
    if (!sort) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];

      if (sort.direction === "asc") return aVal - bVal;
      return bVal - aVal;
    });
  }, [data, sort]);

  function toggleSort(key) {
    setSort((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "desc" };
      }
      return {
        key,
        direction: prev.direction === "desc" ? "asc" : "desc",
      };
    });
  }

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}

      {/* Period Selector */}
      <div className={styles.periodBar}>
        {periods.map((p) => (
          <button
            key={p}
            className={`${styles.periodBtn} ${p === activePeriod ? styles.active : ""}`}
            onClick={() => setActivePeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Symbol</th>
            <th
              className={styles.th}
              onClick={() => toggleSort("price")}
            >
              Price
            </th>
            <th
              className={styles.th}
              onClick={() => toggleSort("change")}
            >
              Change
            </th>
            <th
              className={styles.th}
              onClick={() => toggleSort("changePercent")}
            >
              % Change
            </th>
            <th className={styles.th}>Prev Close</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const isDown = row.change < 0;

            return (
              <tr key={row.symbol}>
                <td className={styles.td}>
                  <div className={styles.symbol}>
                    <strong>{row.symbol}</strong>
                    <span>{row.name}</span>
                  </div>
                </td>

                <td className={styles.td}>{row.price.toFixed(2)}</td>

                <td className={`${styles.td} ${isDown ? styles.down : styles.up}`}>{row.change.toFixed(2)}</td>

                <td className={`${styles.td} ${isDown ? styles.down : styles.up}`}>{row.changePercent.toFixed(2)}%</td>

                <td className={styles.td}>{row.prevClose.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr
      key={i}
      className={styles.skeletonRow}
    >
      <td colSpan='5'>
        <div className={styles.skeleton} />
      </td>
    </tr>
  ));
}
