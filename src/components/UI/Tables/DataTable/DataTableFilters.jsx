"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./DataTableFilters.module.css";

export default function DataTableFilters({ data = [], filters = [], value = {}, onChange }) {
  const [expandedFilters, setExpandedFilters] = useState({});

  const getFilterOptions = (filter) => {
    const counts = new Map();

    data.forEach((row) => {
      const rawValue = row?.[filter.key];

      if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") {
        return;
      }

      const option = String(rawValue);

      counts.set(option, (counts.get(option) || 0) + 1);
    });

    const options = Array.from(counts.entries()).map(([value, count]) => ({
      value,
      count,
    }));

    if (filter.sort === "occurrence") {
      options.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.value.localeCompare(b.value);
      });
    } else {
      options.sort((a, b) => a.value.localeCompare(b.value));
    }

    return options;
  };

  const handleCheckboxChange = (filterKey, optionValue) => {
    const currentValues = value[filterKey] || [];

    const nextValues = currentValues.includes(optionValue) ? currentValues.filter((item) => item !== optionValue) : [...currentValues, optionValue];

    onChange({
      ...value,
      [filterKey]: nextValues,
    });
  };

  const clearFilter = (filterKey) => {
    onChange({
      ...value,
      [filterKey]: [],
    });
  };

  const toggleExpanded = (filterKey) => {
    setExpandedFilters((current) => ({
      ...current,
      [filterKey]: !current[filterKey],
    }));
  };

  return (
    <aside className={styles.container}>
      {filters.map((filter) => {
        const options = getFilterOptions(filter);
        const selectedValues = value[filter.key] || [];

        const isExpanded = expandedFilters[filter.key] === true;

        // Show the first 5 by default.
        // const visibleOptions = isExpanded ? options : options.slice(0, 5);

        const hasMore = options.length > 5;

        return (
          <div
            key={filter.key}
            className={styles.filterGroup}
          >
            <div className={styles.filterHeader}>
              <span className={styles.filterLabel}>{filter.label}</span>

              {selectedValues.length > 0 && (
                <button
                  type='button'
                  className={styles.clearButton}
                  onClick={() => clearFilter(filter.key)}
                  aria-label={`Clear ${filter.label} filter`}
                >
                  <span className={styles.clearIcon}>×</span>
                  <span>Clear</span>
                </button>
              )}
            </div>
            <div className={styles.options}>
              {options.slice(0, 5).map((option) => {
                const checked = selectedValues.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={styles.option}
                  >
                    <span className={styles.optionLeft}>
                      <input
                        type='checkbox'
                        checked={checked}
                        onChange={() => handleCheckboxChange(filter.key, option.value)}
                      />

                      <span className={styles.optionLabel}>{option.value}</span>
                    </span>

                    {filter.showCount && <span className={styles.optionCount}>{option.count}</span>}
                  </label>
                );
              })}

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    className={styles.additionalOptions}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    {options.slice(5).map((option) => {
                      const checked = selectedValues.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className={styles.option}
                        >
                          <span className={styles.optionLeft}>
                            <input
                              type='checkbox'
                              checked={checked}
                              onChange={() => handleCheckboxChange(filter.key, option.value)}
                            />

                            <span className={styles.optionLabel}>{option.value}</span>
                          </span>

                          {filter.showCount && <span className={styles.optionCount}>{option.count}</span>}
                        </label>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasMore && (
              <button
                type='button'
                className={styles.expandButton}
                onClick={() => toggleExpanded(filter.key)}
              >
                {isExpanded ? "Hide" : `Show more (${options.length - 5})`}
              </button>
            )}
          </div>
        );
      })}
    </aside>
  );
}
