"use client";

import React, { useState } from "react";

import RangeFilter from "./RangeFilter/RangeFilter";
import styles from "./DataTableFilters.module.css";

export default function DataTableFilters({ data = [], filters = [], value = {}, onChange }) {
  const [rangeErrors, setRangeErrors] = useState({});

  // --------------------------------------------------
  // Get checkbox options
  // --------------------------------------------------

  const getCheckboxOptions = (filter) => {
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

  // --------------------------------------------------
  // Get numeric range
  // --------------------------------------------------

  const getRange = (filter) => {
    const values = data
      .map((row) => row?.[filter.key])
      .filter((value) => {
        if (value === null || value === undefined || value === "") {
          return false;
        }

        const cleaned = String(value).replace(/[$€£¥₹,\s]/g, "");

        return !Number.isNaN(Number(cleaned));
      })
      .map((value) => Number(String(value).replace(/[$€£¥₹,\s]/g, "")));

    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
      };
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  // --------------------------------------------------
  // Checkbox change
  // --------------------------------------------------

  const handleCheckboxChange = (filterKey, optionValue) => {
    const currentValues = value[filterKey] || [];

    const nextValues = currentValues.includes(optionValue) ? currentValues.filter((item) => item !== optionValue) : [...currentValues, optionValue];

    onChange({
      ...value,
      [filterKey]: nextValues,
    });
  };

  // --------------------------------------------------
  // Clear filter
  // --------------------------------------------------

  const clearFilter = (filterKey) => {
    const nextValue = { ...value };

    delete nextValue[filterKey];

    setRangeErrors((current) => ({
      ...current,
      [filterKey]: false,
    }));

    onChange(nextValue);
  };

  // --------------------------------------------------
  // Range change
  // --------------------------------------------------

  const handleRangeChange = (filterKey, nextRange) => {
    // Editing starts — remove any previous error message
    setRangeErrors((current) => ({
      ...current,
      [filterKey]: false,
    }));

    onChange({
      ...value,
      [filterKey]: nextRange,
    });
  };

  // --------------------------------------------------
  // Validate range
  // --------------------------------------------------

  const validateRange = (filterKey, enteredRange) => {
    const filter = filters.find((item) => item.key === filterKey);

    if (!filter) {
      return;
    }

    const range = getRange(filter);

    let min = enteredRange?.min;
    let max = enteredRange?.max;

    // ------------------------------------------------
    // Empty values use the default range
    // ------------------------------------------------

    if (min === "" || min === undefined || min === null) {
      min = range.min;
    }

    if (max === "" || max === undefined || max === null) {
      max = range.max;
    }

    min = Number(min);
    max = Number(max);

    // ------------------------------------------------
    // Invalid value or invalid relationship
    //
    // Reset to the original/default range.
    // ------------------------------------------------

    if (Number.isNaN(min) || Number.isNaN(max) || min < range.min || max > range.max || min > max) {
      setRangeErrors((current) => ({
        ...current,
        [filterKey]: true,
      }));

      onChange({
        ...value,
        [filterKey]: {
          min: range.min,
          max: range.max,
        },
      });

      return;
    }

    // ------------------------------------------------
    // Valid range
    // ------------------------------------------------

    setRangeErrors((current) => ({
      ...current,
      [filterKey]: false,
    }));

    onChange({
      ...value,
      [filterKey]: {
        min,
        max,
      },
    });
  };

  return (
    <aside className={styles.container}>
      {filters.map((filter) => {
        // ==================================================
        // CHECKBOX FILTER
        // ==================================================

        if (filter.type === "checkbox") {
          const options = getCheckboxOptions(filter);
          const selectedValues = value[filter.key] || [];

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
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className={styles.options}>
                {options.map((option) => {
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
              </div>
            </div>
          );
        }

        // ==================================================
        // NUMERIC RANGE FILTER
        // ==================================================

        if (filter.type === "range") {
          const range = getRange(filter);

          const currentRange = value[filter.key] || {};

          const minValue = currentRange.min !== undefined ? currentRange.min : range.min;

          const maxValue = currentRange.max !== undefined ? currentRange.max : range.max;

          const isFiltered = Number(minValue) !== Number(range.min) || Number(maxValue) !== Number(range.max);

          return (
            <div
              key={filter.key}
              className={styles.filterGroup}
            >
              <div className={styles.filterHeader}>
                <span className={styles.filterLabel}>{filter.label}</span>

                {isFiltered && (
                  <button
                    type='button'
                    className={styles.clearButton}
                    onClick={() => clearFilter(filter.key)}
                  >
                    Clear
                  </button>
                )}
              </div>

              <RangeFilter
                data={data}
                filter={filter}
                value={{
                  min: minValue,
                  max: maxValue,
                }}
                onChange={(nextRange) => handleRangeChange(filter.key, nextRange)}
                onValidate={(nextRange) => validateRange(filter.key, nextRange)}
                error={rangeErrors[filter.key]}
              />
            </div>
          );
        }

        return null;
      })}
    </aside>
  );
}
