"use client";

import { useMemo, useState } from "react";
import styles from "./MarketTable.module.css";

export default function MarketTable({ title, periods = [], defaultPeriod, dataByPeriod = {}, initialSort = null }) {
  // Safe default activePeriod fallback
  const [activePeriod, setActivePeriod] = useState(defaultPeriod || periods[0]);
  const [sort, setSort] = useState(initialSort);

  // Safe lookup using optional chaining & fallback array
  const data = dataByPeriod?.[activePeriod] || [];

  const sortedData = useMemo(() => {
    if (!sort || !Array.isArray(data)) return data;

    return [...data].sort((a, b) => {
      const aVal = a?.[sort.key] ?? 0;
      const bVal = b?.[sort.key] ?? 0;

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

  // Helper to prevent .toFixed(2) crashes when values are undefined/null
  const formatNum = (val) => (typeof val === "number" ? val.toFixed(2) : "—");

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}

      {/* Period Selector */}
      {periods.length > 0 && (
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
      )}

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
          {sortedData.length === 0 ? (
            <SkeletonRows />
          ) : (
            sortedData.map((row, idx) => {
              const isDown = (row?.change ?? 0) < 0;

              return (
                <tr key={row?.symbol || idx}>
                  <td className={styles.td}>
                    <div className={styles.symbol}>
                      <strong>{row?.symbol || "—"}</strong>
                      <span>{row?.name || ""}</span>
                    </div>
                  </td>

                  <td className={styles.td}>{formatNum(row?.price)}</td>

                  <td className={`${styles.td} ${isDown ? styles.down : styles.up}`}>{formatNum(row?.change)}</td>

                  <td className={`${styles.td} ${isDown ? styles.down : styles.up}`}>{typeof row?.changePercent === "number" ? `${row.changePercent.toFixed(2)}%` : "—"}</td>

                  <td className={styles.td}>{formatNum(row?.prevClose)}</td>
                </tr>
              );
            })
          )}
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
