"use client";

import { useMemo, useState } from "react";
import styles from "./MarketTable.module.css";

const DEFAULT_PERIODS = ["1D", "1W", "1M", "3M", "6M", "1Y"];

const PERIOD_DAYS = {
  "1D": 1,
  "1W": 5,
  "1M": 21,
  "3M": 63,
  "6M": 126,
  "1Y": 250,
};

export default function MarketTable({ data = [], periods = DEFAULT_PERIODS, defaultPeriod = "1M", locale }) {
  const [activePeriod, setActivePeriod] = useState(periods.includes(defaultPeriod) ? defaultPeriod : periods[0]);

  const [sort, setSort] = useState({
    key: "changePercent",
    direction: "desc",
  });

  /*
   * ----------------------------------------------------------
   * Prepare market data
   * ----------------------------------------------------------
   */

  const instruments = useMemo(() => {
    return data
      .map((instrument) => ({
        ...instrument,
        history: [...(instrument.history || [])].sort((a, b) => new Date(a.date) - new Date(b.date)),
      }))
      .filter((instrument) => instrument.history.length > 0);
  }, [data]);

  /*
   * ----------------------------------------------------------
   * Calculate current period information
   * ----------------------------------------------------------
   */

  const tableData = useMemo(() => {
    const periodDays = PERIOD_DAYS[activePeriod] || 21;

    return instruments.map((instrument) => {
      const history = instrument.history;

      const latestIndex = history.length - 1;

      const latest = history[latestIndex];

      /*
       * We need the price from N trading days ago.
       *
       * For example:
       *
       * 1D = previous trading day
       * 1W = approximately 5 trading days
       * 1M = approximately 21 trading days
       */

      const startIndex = Math.max(0, latestIndex - periodDays);

      const start = history[startIndex];

      const lastPrice = latest.close;
      const periodStartPrice = start.close;

      const change = lastPrice - periodStartPrice;

      const changePercent = periodStartPrice !== 0 ? (change / periodStartPrice) * 100 : 0;

      return {
        ...instrument,

        lastPrice,
        periodStartPrice,
        change,
        changePercent,

        startDate: start.date,
        endDate: latest.date,
      };
    });
  }, [instruments, activePeriod]);

  // Date used in the "Price on..." column heading
  const periodStartDate = tableData[0]?.startDate;

  /*
   * ----------------------------------------------------------
   * Sort table
   * ----------------------------------------------------------
   */

  const sortedData = useMemo(() => {
    if (!sort) {
      return tableData;
    }

    return [...tableData].sort((a, b) => {
      const aValue = a[sort.key] ?? 0;

      const bValue = b[sort.key] ?? 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [tableData, sort]);

  /*
   * ----------------------------------------------------------
   * Date range
   *
   * We use the actual trading dates from the data rather
   * than calculating calendar dates.
   * ----------------------------------------------------------
   */

  const dateRange = useMemo(() => {
    if (tableData.length === 0) {
      return null;
    }

    return {
      startDate: tableData[0].startDate,
      endDate: tableData[0].endDate,
    };
  }, [tableData]);

  /*
   * ----------------------------------------------------------
   * Sorting
   * ----------------------------------------------------------
   */

  function toggleSort(key) {
    setSort((previous) => {
      if (!previous || previous.key !== key) {
        return {
          key,
          direction: "desc",
        };
      }

      return {
        key,
        direction: previous.direction === "desc" ? "asc" : "desc",
      };
    });
  }

  /*
   * ----------------------------------------------------------
   * Formatting
   * ----------------------------------------------------------
   */

  function formatNumber(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "—";
    }

    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatChange(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "—";
    }

    const sign = value > 0 ? "+" : "";

    return `${sign}${formatNumber(value)}`;
  }

  function formatPercent(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "—";
    }

    const sign = value > 0 ? "+" : "";

    return `${sign}${value.toFixed(2)}%`;
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  /*
   * ----------------------------------------------------------
   * Render
   * ----------------------------------------------------------
   */

  return (
    <div className={styles.container}>
      {/* -------------------------------------------------- */}
      {/* Period / Date row */}
      {/* -------------------------------------------------- */}

      <div className={styles.periodHeader}>
        <div className={styles.periodInfo}>
          {dateRange && (
            <span className={styles.dateRange}>
              {formatDate(dateRange.startDate)} → {formatDate(dateRange.endDate)}
            </span>
          )}

          <div className={styles.periodBar}>
            {periods.map((period) => (
              <button
                key={period}
                type='button'
                className={`${styles.periodBtn} ${period === activePeriod ? styles.active : ""}`}
                onClick={() => setActivePeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Table */}
      {/* -------------------------------------------------- */}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.th}
                onClick={() => toggleSort("symbol")}
              >
                Symbol
              </th>

              <th className={styles.th}>Performance</th>

              <th className={styles.th}>Price on {periodStartDate ? formatDate(periodStartDate) : ""}</th>

              <th className={styles.th}>Last Price</th>

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
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <SkeletonRows />
            ) : (
              sortedData.map((instrument) => {
                const isDown = instrument.change < 0;

                return (
                  <tr key={instrument.yahooSymbol || instrument.symbol}>
                    {/* Symbol */}
                    <td className={styles.td}>
                      <div className={styles.symbol}>
                        <strong>{instrument.symbol}</strong>
                        <span>{instrument.name}</span>
                      </div>
                    </td>

                    {/* Heatmap */}
                    <td className={styles.td}>
                      <PerformanceHeatmap
                        history={instrument.history}
                        period={activePeriod}
                      />
                    </td>

                    {/* Starting price */}
                    <td className={styles.td}>{formatNumber(instrument.periodStartPrice)}</td>

                    {/* Last price */}
                    <td className={styles.td}>{formatNumber(instrument.lastPrice)}</td>

                    {/* Change */}
                    <td className={`${styles.td} ${instrument.change < 0 ? styles.down : styles.up}`}>{formatChange(instrument.change)}</td>

                    {/* Change % */}
                    <td className={`${styles.td} ${instrument.change < 0 ? styles.down : styles.up}`}>{formatPercent(instrument.changePercent)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * Performance Heatmap
 * ============================================================
 *
 * Six blocks representing the six most recent periods of
 * the currently selected period.
 *
 * 1D → 6 trading days
 * 1W → 6 weeks
 * 1M → 6 months
 * 3M → 6 x 3-month periods where available
 * 6M → 6 x 6-month periods where available
 * 1Y → blank
 *
 * ============================================================
 */

function PerformanceHeatmap({ history, period }) {
  if (!history || history.length === 0 || period === "1Y") {
    return <span className={styles.heatmapEmpty}>—</span>;
  }

  const periodDays = PERIOD_DAYS[period] || 21;

  const periods = [];

  /*
   * Start from the most recent completed period.
   *
   * Each block compares:
   *
   * ending price
   * against
   * price at the beginning of that period
   */

  let endIndex = history.length - 1;

  for (let i = 0; i < 6; i++) {
    const startIndex = endIndex - periodDays;

    if (startIndex < 0) {
      break;
    }

    const start = history[startIndex];

    const end = history[endIndex];

    const percent = start.close !== 0 ? ((end.close - start.close) / start.close) * 100 : 0;

    periods.unshift(percent);

    endIndex = startIndex;
  }

  return (
    <div className={styles.heatmap}>
      {periods.map((value, index) => (
        <span
          key={index}
          className={getHeatClass(value, styles)}
          title={`${value >= 0 ? "+" : ""}${value.toFixed(2)}%`}
        />
      ))}
    </div>
  );
}

/*
 * ------------------------------------------------------------
 * Heatmap intensity
 * ------------------------------------------------------------
 */

function getHeatClass(value, styles) {
  if (value >= 4) {
    return styles.heatStrongPositive;
  }

  if (value >= 1.5) {
    return styles.heatPositive;
  }

  if (value > 0) {
    return styles.heatWeakPositive;
  }

  if (value <= -4) {
    return styles.heatStrongNegative;
  }

  if (value <= -1.5) {
    return styles.heatNegative;
  }

  if (value < 0) {
    return styles.heatWeakNegative;
  }

  return styles.heatNeutral;
}

/*
 * ============================================================
 * Skeleton
 * ============================================================
 */

function SkeletonRows() {
  return Array.from({
    length: 6,
  }).map((_, index) => (
    <tr
      key={index}
      className={styles.skeletonRow}
    >
      <td colSpan='5'>
        <div className={styles.skeleton} />
      </td>
    </tr>
  ));
}
