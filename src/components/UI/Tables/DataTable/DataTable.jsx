"use client";

import React, { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import styles from "./DataTable.module.css";

export default function DataTable({ data = [] }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Dynamically create column definitions based on JSON keys
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sample = data[0];
    return Object.keys(sample).map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      cell: (info) => {
        const val = info.getValue();
        if (typeof val === "boolean") return val ? "Yes" : "No";
        if (val === null || val === undefined) {
          return <span className={styles.emptyValue}>—</span>;
        }
        return String(val);
      },
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={styles.container}>
      {/* Top Controls Bar */}
      <div className={styles.topBar}>
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

        <div className={styles.search}>
          <label htmlFor='tableSearch'>Search:</label>
          <input
            id='tableSearch'
            type='text'
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
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
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`${styles.th} ${isSorted ? styles.thSorted : ""}`}
                    >
                      <div className={styles.thContent}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className={styles.sortIcons}>
                          <span className={isSorted === "asc" ? styles.activeSort : ""}>▲</span>
                          <span className={isSorted === "desc" ? styles.activeSort : ""}>▼</span>
                        </span>
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
                    return (
                      <td
                        key={cell.id}
                        className={`${styles.td} ${isSorted ? styles.tdSorted : ""}`}
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
                  colSpan={columns.length}
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
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
