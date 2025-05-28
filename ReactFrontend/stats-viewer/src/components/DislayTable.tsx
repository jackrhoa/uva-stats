import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

interface DisplayTableProps {
  table: Table<any>;
}

const DislayTable: React.FC<DisplayTableProps> = ({ table }) => {
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
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-blue-50 transition-colors`}
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
      </table>
    </div>
  );
};

export default DislayTable;
