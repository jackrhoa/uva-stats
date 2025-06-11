import React from "react";
import { flexRender, type Table, type Row } from "@tanstack/react-table";

export interface DisplayTableProps<T extends object> {
  table: Table<T>;
  isRowHighlighted?: (row: Row<T>) => boolean;
  customHeaders?: React.ReactNode;
  reducers?: {
    [key: string]: (acc: any, row: Row<T>) => void;
  };
}

const DislayTable = <T extends object>({
  table,
  isRowHighlighted,
  customHeaders,
}: DisplayTableProps<T>) => {
  // These should not be defined inside the component as that results in the code being
  // re-executed each time a new table is rendered.
  // instead, they should be defined in the component which calls this component

  // Track columns needed for calculating averages

  return (
    <div className="mb-5 flex flex-col gap-5">
      {customHeaders && <div>{customHeaders}</div>}

      <div
        className={`w-full h-[70vh] overflow-x-auto shadow-lg rounded-lg border border-gray-300 
      }`}
        style={
          {
            "--header-bg": "#1f2937", // bg-gray-800 equivalent
            "--header-border": "#4b5563", // border-gray-600 equivalent
          } as React.CSSProperties
        }
      >
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
                    className="px-2 py-3 text-center font-bold bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors uppercase tracking-wide text-xs relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-px before:bg-gray-600 h-12"
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

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`  ${
                  isRowHighlighted?.(row) ? "bg-blue-50" : "bg-white"
                }
               hover:bg-orange-50 transition-colors`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 text-center border border-gray-200 font-mono text-gray-800 h-8 ${
                      cell.column.id === "player_name" &&
                      isRowHighlighted?.(row)
                        ? "font-bold"
                        : "font-mono"
                    }
                    `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot className="sticky bottom-0 z-10 bg-gray-100 font-bold text-sm">
            {table.getFooterGroups().map((footerGroup) => (
              <tr
                key={footerGroup.id}
                className="font-semibold border-t-2 border-gray-400"
              >
                {footerGroup.headers.map((footer) => (
                  <td
                    key={footer.id}
                    className={`px-3 py-2 text-center border border-gray-200 text-gray-800 bg-gray-100 h-12 ${
                      footer.column.getIsVisible() ? "" : "hidden"
                    }`}
                  >
                    {/* Render the footer if it exists, otherwise empty */}
                    {footer.isPlaceholder
                      ? null
                      : typeof footer.column.columnDef.footer === "function"
                      ? flexRender(
                          footer.column.columnDef.footer,
                          footer.getContext()
                        )
                      : footer.column.columnDef.footer || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DislayTable;
