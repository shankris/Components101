"use client";

import React, { useMemo, useRef, useState } from "react";

import styles from "./RangeFilter.module.css";

export default function RangeFilter({ data = [], filter, value = {}, onChange, onValidate, error = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);

  // --------------------------------------------------
  // Calculate available range
  // --------------------------------------------------

  const range = useMemo(() => {
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
  }, [data, filter.key]);

  const minValue = value.min ?? range.min;
  const maxValue = value.max ?? range.max;

  const numericMin = Number(minValue);
  const numericMax = Number(maxValue);

  // --------------------------------------------------
  // Histogram
  // --------------------------------------------------

  const histogram = useMemo(() => {
    if (range.max === range.min) {
      return [
        {
          min: range.min,
          max: range.max,
          count: data.length,
        },
      ];
    }

    const bucketCount = 12;

    const totalRange = range.max - range.min;
    const bucketSize = totalRange / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const rawMin = range.min + index * bucketSize;
      const rawMax = index === bucketCount - 1 ? range.max : range.min + (index + 1) * bucketSize;

      /*
       * Display values as inclusive integer ranges.
       *
       * Example:
       * 35–39
       * 40–43
       *
       * rather than:
       * 35–39
       * 39–43
       */

      const displayMin = Math.ceil(rawMin);

      const displayMax = index === bucketCount - 1 ? Math.floor(rawMax) : Math.floor(rawMax - 0.000001);

      return {
        min: rawMin,
        max: rawMax,
        displayMin,
        displayMax,
        count: 0,
      };
    });

    data.forEach((row) => {
      const rawValue = row?.[filter.key];

      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return;
      }

      const numericValue = Number(String(rawValue).replace(/[$€£¥₹,\s]/g, ""));

      if (Number.isNaN(numericValue)) {
        return;
      }

      let index = Math.floor((numericValue - range.min) / bucketSize);

      index = Math.max(0, Math.min(index, bucketCount - 1));

      buckets[index].count += 1;
    });

    return buckets;
  }, [data, filter.key, range]);

  const highestCount = Math.max(...histogram.map((bucket) => bucket.count), 1);

  // --------------------------------------------------
  // Check selected bucket
  // --------------------------------------------------

  const isBucketSelected = (bucket) => {
    const bucketCenter = (bucket.displayMin + bucket.displayMax) / 2;

    return bucketCenter >= numericMin && bucketCenter <= numericMax;
  };

  // --------------------------------------------------
  // Histogram selection
  // --------------------------------------------------

  const selectHistogramRange = (startIndex, endIndex) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    const firstBucket = histogram[start];
    const lastBucket = histogram[end];

    if (!firstBucket || !lastBucket) {
      return;
    }

    onChange({
      min: firstBucket.displayMin,
      max: lastBucket.displayMax,
    });
  };

  const handleBarMouseDown = (index) => {
    dragStart.current = index;
    setIsDragging(true);

    selectHistogramRange(index, index);
  };

  const handleBarMouseEnter = (index) => {
    if (!isDragging || dragStart.current === null) {
      return;
    }

    selectHistogramRange(dragStart.current, index);
  };

  const handleBarMouseUp = () => {
    dragStart.current = null;
    setIsDragging(false);
  };

  // --------------------------------------------------
  // Slider changes
  // --------------------------------------------------

  const handleMinSliderChange = (event) => {
    const nextMin = Number(event.target.value);

    if (nextMin > numericMax) {
      return;
    }

    onChange({
      min: nextMin,
      max: numericMax,
    });
  };

  const handleMaxSliderChange = (event) => {
    const nextMax = Number(event.target.value);

    if (nextMax < numericMin) {
      return;
    }

    onChange({
      min: numericMin,
      max: nextMax,
    });
  };

  // --------------------------------------------------
  // Text input changes
  // --------------------------------------------------

  const handleMinInputChange = (event) => {
    onChange({
      min: event.target.value,
      max: maxValue,
    });
  };

  const handleMaxInputChange = (event) => {
    onChange({
      min: minValue,
      max: event.target.value,
    });
  };

  // --------------------------------------------------
  // Validate
  // --------------------------------------------------

  const handleValidate = () => {
    onValidate?.({
      min: minValue,
      max: maxValue,
    });
  };

  return (
    <div className={styles.container}>
      {/* Histogram */}

      <div
        className={styles.histogram}
        onMouseLeave={() => {
          if (isDragging) {
            handleBarMouseUp();
          }
        }}
        onMouseUp={handleBarMouseUp}
      >
        {histogram.map((bucket, index) => {
          const selected = isBucketSelected(bucket);

          const height = Math.max(4, (bucket.count / highestCount) * 100);

          const bucketLabel = bucket.displayMin === bucket.displayMax ? `${bucket.displayMin}` : `${bucket.displayMin}–${bucket.displayMax}`;

          return (
            <div
              key={index}
              className={`${styles.barWrapper} ${selected ? styles.selected : styles.unselected}`}
              title={`${filter.label} ${bucketLabel}: ${bucket.count}`}
              onMouseDown={() => handleBarMouseDown(index)}
              onMouseEnter={() => handleBarMouseEnter(index)}
            >
              <div
                className={styles.bar}
                style={{
                  height: `${height}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Range slider */}

      <div className={styles.slider}>
        <input
          type='range'
          min={range.min}
          max={range.max}
          step={1}
          value={numericMin}
          onChange={handleMinSliderChange}
          aria-label={`${filter.label} minimum`}
        />

        <input
          type='range'
          min={range.min}
          max={range.max}
          step={1}
          value={numericMax}
          onChange={handleMaxSliderChange}
          aria-label={`${filter.label} maximum`}
        />
      </div>

      {/* Text inputs */}

      <div className={styles.rangeInputs}>
        <input
          type='number'
          value={minValue}
          min={range.min}
          max={range.max}
          aria-label={`${filter.label} minimum`}
          onChange={handleMinInputChange}
          onBlur={handleValidate}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleValidate();
            }
          }}
        />

        <span className={styles.rangeSeparator}>–</span>

        <input
          type='number'
          value={maxValue}
          min={range.min}
          max={range.max}
          aria-label={`${filter.label} maximum`}
          onChange={handleMaxInputChange}
          onBlur={handleValidate}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleValidate();
            }
          }}
        />
      </div>

      {/* Validation message */}

      {error && <div className={styles.rangeError}>Invalid range selected</div>}
    </div>
  );
}
