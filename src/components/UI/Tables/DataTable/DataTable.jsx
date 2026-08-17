"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";

import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast, Search, X } from "lucide-react";

import cellComponents from "./cells";
import DataTableFilters from "./DataTableFilters";
import styles from "./DataTable.module.css";

// --------------------------------------------------
// Check whether a value is numeric
// Handles numbers and numeric strings such as:
//
// 20000
// "20000"
// "20,000"
// "$20,000"
// "₹20,000"
// "€20,000"
// "£20,000"
// --------------------------------------------------

const isNumericValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  if (typeof value === "number") {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const cleaned = value.replace(/[$€£¥₹,\s]/g, "").trim();

  return cleaned !== "" && !Number.isNaN(Number(cleaned));
};

export default function DataTable({ data = [], config = [], filters = [] }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterState, setFilterState] = useState({});

  const searchInputRef = useRef(null);

  // --------------------------------------------------
  // Search textbox keyboard access
  // --------------------------------------------------

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  // --------------------------------------------------
  // Safely ensure data is an array
  // --------------------------------------------------

  const safeData = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }

    return [];
  }, [data]);

  // --------------------------------------------------
  // Build columns dynamically
  // --------------------------------------------------

  const columns = useMemo(() => {
    if (Array.isArray(config) && config.length > 0) {
      return config.map((col) => {
        const key = typeof col === "string" ? col : col.key;

        const label = typeof col === "object" && col.label ? col.label : key ? key.charAt(0).toUpperCase() + key.slice(1).replace(/\_/g, " ") : "";

        // ------------------------------------------------
        // Explicit alignment always wins.
        //
        // Otherwise inspect the first available value
        // to determine whether this is a numeric column.
        // ------------------------------------------------

        let align;

        if (typeof col === "object" && col.align) {
          align = col.align;
        } else {
          const sampleValue = safeData.find((row) => row?.[key] !== null && row?.[key] !== undefined && row?.[key] !== "")?.[key];

          align = isNumericValue(sampleValue) ? "right" : "left";
        }

        const CellComponent = typeof col === "object" && col.cell ? cellComponents[col.cell] : null;

        const sortValue = typeof col === "object" && Array.isArray(col.sortValue) ? col.sortValue : null;

        const columnDefinition = {
          header: label,

          meta: {
            align,
            hideHeader: col.hideHeader === true,
            width: col.width,
          },

          enableSorting: col.enableSorting !== false,

          cell: (info) => {
            if (CellComponent) {
              return (
                <CellComponent
                  {...info.row.original}
                  value={info.getValue()}
                  config={col}
                />
              );
            }

            const val = info.getValue();

            if (typeof val === "boolean") {
              return val ? "Yes" : "No";
            }

            if (val === null || val === undefined) {
              return <span className={styles.emptyValue}>—</span>;
            }

            return String(val);
          },
        };

        // ------------------------------------------------
        // Custom sorting value
        // ------------------------------------------------

        if (sortValue) {
          columnDefinition.accessorFn = (row) =>
            sortValue
              .map((field) => row[field])
              .filter((value) => value !== null && value !== undefined)
              .join(" ");
        } else {
          columnDefinition.accessorKey = key;
        }

        return columnDefinition;
      });
    }

    // --------------------------------------------------
    // Auto generate columns if config is missing
    // --------------------------------------------------

    if (safeData.length > 0) {
      const sample = safeData[0];

      return Object.keys(sample).map((key) => {
        const sampleValue = safeData.find((row) => row?.[key] !== null && row?.[key] !== undefined && row?.[key] !== "")?.[key];

        const align = isNumericValue(sampleValue) ? "right" : "left";

        return {
          accessorKey: key,

          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/\_/g, " "),

          meta: {
            align,
          },

          cell: (info) => {
            const val = info.getValue();

            if (val === null || val === undefined) {
              return "—";
            }

            return String(val);
          },
        };
      });
    }

    return [];
  }, [safeData, config]);

  // --------------------------------------------------
  // Apply custom filters
  // --------------------------------------------------

  const filteredData = useMemo(() => {
    if (!filters.length) {
      return safeData;
    }

    return safeData.filter((row) => {
      return filters.every((filter) => {
        // -----------------------------------------------
        // Checkbox filter
        // -----------------------------------------------

        if (filter.type === "checkbox") {
          const selectedValues = filterState[filter.key] || [];

          if (selectedValues.length === 0) {
            return true;
          }

          return selectedValues.includes(String(row?.[filter.key]));
        }

        // -----------------------------------------------
        // Numeric range filter
        // -----------------------------------------------

        if (filter.type === "range") {
          const selectedRange = filterState[filter.key];

          if (!selectedRange) {
            return true;
          }

          const rawValue = row?.[filter.key];

          if (rawValue === null || rawValue === undefined || rawValue === "") {
            return false;
          }

          const numericValue = Number(String(rawValue).replace(/[$€£¥₹,\s]/g, ""));

          if (Number.isNaN(numericValue)) {
            return false;
          }

          const min = selectedRange.min !== undefined && selectedRange.min !== "" ? Number(selectedRange.min) : -Infinity;

          const max = selectedRange.max !== undefined && selectedRange.max !== "" ? Number(selectedRange.max) : Infinity;

          return numericValue >= min && numericValue <= max;
        }

        return true;
      });
    });
  }, [safeData, filters, filterState]);

  // --------------------------------------------------
  // TanStack Table
  // --------------------------------------------------

  const table = useReactTable({
    data: filteredData,
    columns,

    state: {
      sorting,
      globalFilter,
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim();

      if (!search) {
        return true;
      }

      return Object.values(row.original).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search),
      );
    },

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();

  const currentPage = table.getState().pagination.pageIndex;

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const getPageNumbers = () => {
    const pages = [];

    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(0);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(1, currentPage - 1);

    const end = Math.min(pageCount - 2, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < pageCount - 4) {
      pages.push("...");
    }

    pages.push(pageCount - 1);

    return pages;
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className={styles.container}>
      <div className={filters.length > 0 ? styles.filteredLayout : undefined}>
        {filters.length > 0 && (
          <DataTableFilters
            data={safeData}
            filters={filters}
            value={filterState}
            onChange={setFilterState}
          />
        )}

        <div className={styles.tableArea}>
          {/* Top Controls Bar */}

          <div className={styles.topBar}>
            <div className={styles.pageSize}>
              <div className={styles.lengthSelect}>
                <label htmlFor='pageSize'>Show</label>

                <select
                  id='pageSize'
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                  {[10, 25, 50, 100].map((pageSize) => (
                    <option
                      key={pageSize}
                      value={pageSize}
                    >
                      {pageSize}
                    </option>
                  ))}
                </select>

                <span>entries</span>
              </div>
            </div>

            <div className={styles.search}>
              <div className={styles.searchInputWrapper}>
                <Search
                  className={styles.searchIcon}
                  size={17}
                />

                <input
                  ref={searchInputRef}
                  id='tableSearch'
                  type='text'
                  value={globalFilter}
                  placeholder='Search the table'
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />

                {globalFilter && (
                  <button
                    type='button'
                    className={styles.clearSearch}
                    onClick={() => setGlobalFilter("")}
                    aria-label='Clear search'
                  >
                    <X size={16} />
                  </button>
                )}

                {!globalFilter && <span className={styles.searchShortcut}>Alt + T</span>}
              </div>
            </div>
          </div>

          {/* Table Container */}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const isSorted = header.column.getIsSorted();

                      const align = header.column.columnDef.meta?.align || "left";

                      return (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`${styles.th} ${align === "right" ? styles.alignRight : align === "center" ? styles.alignCenter : styles.alignLeft} ${isSorted ? styles.thSorted : ""}`}
                        >
                          <div className={`${styles.thContent} ${align === "right" ? styles.justifyRight : align === "center" ? styles.justifyCenter : styles.justifyLeft}`}>
                            {!header.column.columnDef.meta?.hideHeader && (
                              <>
                                {flexRender(header.column.columnDef.header, header.getContext())}

                                <span className={styles.sortIcons}>
                                  <span className={isSorted === "asc" ? styles.activeSort : ""}>▲</span>

                                  <span className={isSorted === "desc" ? styles.activeSort : ""}>▼</span>
                                </span>
                              </>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={styles.tr}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isSorted = cell.column.getIsSorted();

                        const align = cell.column.columnDef.meta?.align || "left";

                        return (
                          <td
                            key={cell.id}
                            className={`${styles.td} ${align === "right" ? styles.alignRight : align === "center" ? styles.alignCenter : styles.alignLeft} ${isSorted ? styles.tdSorted : ""}`}
                            data-label={cell.column.columnDef.header}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className={styles.noResults}
                    >
                      No matching records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Controls Bar */}

          <div className={styles.bottomBar}>
            <div className={styles.info}>
              Showing {table.getFilteredRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
            </div>

            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronFirst size={16} />
              </button>

              <button
                className={styles.pageBtn}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className={styles.dots}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ""}`}
                    onClick={() => table.setPageIndex(page)}
                  >
                    {page + 1}
                  </button>
                ),
              )}

              <button
                className={styles.pageBtn}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={16} />
              </button>

              <button
                className={styles.pageBtn}
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronLast size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
