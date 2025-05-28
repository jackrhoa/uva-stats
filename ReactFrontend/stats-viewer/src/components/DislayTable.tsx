import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

interface DisplayTableProps {
  table: Table<any>;
  highlight_condition?: any;
  highlight_gte_value?: number;
  enableFilters?: boolean;
}

const DislayTable: React.FC<DisplayTableProps> = ({
  table,
  highlight_condition,
  highlight_gte_value = 0,
  enableFilters,
}) => {
  const totals: Record<string, any> = {};

  // Track columns needed for calculating averages
  const hits = { total: 0 };
  const ab = { total: 0 };
  const pa = { total: 0 };
  const so = { total: 0 };
  const outs = { total: 0 };
  const er = { total: 0 };

  table.getRowModel().rows.forEach((row) => {
    table.getAllLeafColumns().forEach((column) => {
      const value = row.getValue(column.id);
      if (typeof value === "number") {
        totals[column.id] = (totals[column.id] || 0) + value;

        // Track specific statistics needed for averages
        if (column.id === "total_hits" || column.id === "hits")
          hits.total += value;
        if (column.id === "total_ab" || column.id === "ab") ab.total += value;
        if (column.id === "total_pa" || column.id === "pa") pa.total += value;
        if (column.id === "total_so" || column.id === "so") so.total += value;

        if (column.id === "total_ip" || column.id === "ip")
          outs.total += 10 * value - 7 * Math.floor(value);

        if (column.id === "total_er" || column.id === "er") er.total += value;
      }
    });
  });

  // Compute average statistics
  const averages = {
    total_avg: ab.total > 0 ? hits.total / ab.total : 0,
    total_obp:
      pa.total > 0
        ? (hits.total + (totals.total_bb || 0) + (totals.total_hbp || 0)) /
          pa.total
        : 0,
    total_slg:
      ab.total > 0
        ? (hits.total +
            (totals.total_double || 0) +
            2 * (totals.total_triple || 0) +
            3 * (totals.total_hr || 0)) /
          ab.total
        : 0,
    total_era: outs.total > 0 ? (27 * er.total) / outs.total : 0,
    total_kp9: outs.total > 0 ? (27 * so.total) / outs.total : 0,
  };
  return (
    <div
      className={`w-full h-[90vh] overflow-x-auto shadow-lg rounded-lg border border-gray-300 
      }`}
      style={
        {
          "--header-bg": "#1f2937", // bg-gray-800 equivalent
          "--header-border": "#4b5563", // border-gray-600 equivalent
        } as React.CSSProperties
      }
    >
      {enableFilters && (
        <div className="flex gap-4 px-4 py-2 bg-gray-100 border-b border-gray-300">
          <div className="flex flex-col">
            <label
              htmlFor="minHR"
              className="text-xs font-semibold text-gray-600"
            >
              Min HR
            </label>
            <input
              id="minHR"
              type="number"
              className="border px-2 py-1 rounded text-black"
              onChange={(e) => {
                const column = table.getColumn("total_hr");
                column?.setFilterValue(
                  e.target.value ? Number(e.target.value) : undefined
                );
              }}
              placeholder="e.g. 5"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="wins"
              className="text-xs font-semibold text-gray-600"
            >
              Has Win
            </label>
            <select
              id="wins"
              className="border px-2 py-1 rounded text-black"
              onChange={(e) => {
                const value = e.target.value;
                const column = table.getColumn("total_wins");
                column?.setFilterValue(
                  value === "true" ? 1 : value === "false" ? 0 : undefined
                );
              }}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      )}
      {/* Begin pitcher table */}

      <table
        className="w-full h-full border-separate border-spacing-0 bg-white text-sm table-auto"
        style={{ borderCollapse: "separate" }}
      >
        <thead className="sticky top-0 z-10 bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="bg-gray-800 text-white"
              style={{ background: "var(--header-bg)" }}
            >
              {headerGroup.headers.map((header) => (
                <th
                  colSpan={header.colSpan}
                  key={header.id}
                  className="px-3 py-3 text-center font-bold bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors uppercase tracking-wide text-xs relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-px before:bg-gray-600"
                  style={{
                    boxShadow:
                      "inset 1px 0 0 rgba(0,0,0,0), inset 0 1px 0 rgba(0,0,0,0), inset -1px 0 0 rgba(75,85,99,1)",
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center justify-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <span
                      className={`text-sm font-bold ${
                        header.column.getIsSorted()
                          ? "opacity-90"
                          : "opacity-60"
                      }`}
                    >
                      {
                        {
                          asc: "▲",
                          desc: "▼",
                          false: header.column.getCanSort() ? "⇕" : "",
                        }[(header.column.getIsSorted() as string) ?? false]
                      }
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="h-full">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`${
                parseFloat(row.getValue(highlight_condition)) >
                highlight_gte_value
                  ? "bg-blue-50"
                  : "bg-white"
              } hover:bg-orange-50 transition-colors`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 text-center border border-gray-200 font-mono text-gray-800"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 z-10 bg-gray-100">
          <tr className="font-semibold border-t-2 border-gray-400">
            {table.getAllLeafColumns().map((column) => (
              <td
                key={column.id}
                className="px-3 py-2 text-center border border-gray-200 font-mono text-gray-800 bg-gray-100"
              >
                {column.id === "player_name"
                  ? "TOTALS"
                  : column.id === "jersey_number"
                  ? table.getRowModel().rows.length
                  : column.id === "total_avg" || column.id === "avg"
                  ? averages.total_avg.toFixed(3).replace(/^0+/, "")
                  : column.id === "total_era" || column.id === "era"
                  ? averages.total_era.toFixed(2)
                  : column.id === "total_obp" || column.id === "obp"
                  ? averages.total_obp.toFixed(3).replace(/^0+/, "")
                  : column.id === "total_slg" || column.id === "slg"
                  ? averages.total_slg.toFixed(3).replace(/^0+/, "")
                  : column.id === "total_ops" || column.id === "ops"
                  ? (averages.total_obp + averages.total_slg)
                      .toFixed(3)
                      .replace(/^0+/, "")
                  : column.id === "total_kp9" || column.id === "kp9"
                  ? averages.total_kp9.toFixed(2)
                  : column.id === "IP" || column.id === "total_ip"
                  ? (
                      Math.floor(outs.total / 3) +
                      (outs.total % 3) * 0.1
                    ).toFixed(1)
                  : typeof totals[column.id] === "number"
                  ? typeof column.columnDef.cell === "function" &&
                    column.columnDef.cell.toString().includes("toFixed")
                    ? totals[column.id].toFixed(1)
                    : totals[column.id]
                  : ""}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DislayTable;
