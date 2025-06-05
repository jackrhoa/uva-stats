import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

interface DisplayTableProps {
  table: Table<any>;
  highlight_condition?: any;
  highlight_gte_value?: number;
  filterEnabled?: boolean;
}

const DislayTable: React.FC<DisplayTableProps> = ({
  table,
  highlight_condition,
  highlight_gte_value = 0,
  filterEnabled,
}) => {
  const totals: Record<string, any> = {};

  // Track columns needed for calculating averages
  const hits = { total: 0 };
  const ab = { total: 0 };
  const pa = { total: 0 };
  const so = { total: 0 };
  const outs = { total: 0 };
  const er = { total: 0 };
  const bb = { total: 0 };
  const hbp = { total: 0 };
  const ibb = { total: 0 };
  const sf = { total: 0 };
  const po = { total: 0 };
  const a = { total: 0 };
  const e = { total: 0 };
  const tb = { total: 0 };
  const hr = { total: 0 };
  const sb = { total: 0 };
  const cs = { total: 0 };

  table.getRowModel().rows.forEach((row) => {
    table.getAllLeafColumns().forEach((column) => {
      const value = row.getValue(column.id);
      if (typeof value === "string") {
        if (column.id === "total_ip" || column.id === "ip") {
          const ip: number = parseFloat(value);
          outs.total += 10 * ip - 7 * Math.floor(ip);
        }
      }

      if (typeof value === "number") {
        totals[column.id] = (totals[column.id] || 0) + value;

        // Track specific statistics needed for averages
        if (column.id === "total_hits" || column.id === "hits")
          hits.total += value;
        if (column.id === "total_ip" || column.id === "ip") {
          outs.total += 10 * value - 7 * Math.floor(value);
        }

        if (column.id === "total_ab" || column.id === "ab") ab.total += value;
        if (column.id === "total_pa" || column.id === "pa") pa.total += value;
        if (column.id === "total_strikeouts" || column.id === "so")
          so.total += value;
        if (column.id === "total_hr" || column.id === "hr") hr.total += value;
        if (column.id === "total_bb" || column.id === "bb") bb.total += value;
        if (column.id === "total_sf" || column.id === "sf") sf.total += value;
        if (column.id === "total_hbp" || column.id === "hbp")
          hbp.total += value;
        if (column.id === "total_ibb" || column.id === "ibb")
          ibb.total += value;
        if (column.id === "total_tb" || column.id === "tb") tb.total += value;

        if (column.id === "total_po" || column.id === "po") po.total += value;
        if (column.id === "total_a" || column.id === "a") a.total += value;
        if (column.id === "total_e" || column.id === "e") e.total += value;
        if (column.id === "total_er" || column.id === "er") er.total += value;
        if (column.id === "sb" || column.id === "total_sb") sb.total += value;
        if (column.id === "cs" || column.id === "total_cs") cs.total += value;
      }
    });
  });

  const averages = {
    total_avg: ab.total > 0 ? hits.total / ab.total : 0,
    total_obp:
      ab.total + bb.total + hbp.total + ibb.total + sf.total > 0
        ? (hits.total + hbp.total + bb.total + ibb.total) /
          (ab.total + bb.total + hbp.total + ibb.total + sf.total)
        : null,
    total_slg: ab.total > 0 ? tb.total / ab.total : null,
    total_fcpt:
      a.total + po.total + e.total > 0
        ? (a.total + po.total) / (a.total + po.total + e.total)
        : null,
    total_era: outs.total > 0 ? (27 * er.total) / outs.total : 0,
    total_kp9: outs.total > 0 ? (27 * so.total) / outs.total : 0,
    total_babip:
      ab.total > 0
        ? (hits.total - hr.total) / (ab.total - so.total - hr.total + sf.total)
        : null,
    total_ab_per_hr: ab.total > 0 ? ab.total / hr.total : null,
    total_chances: a.total + po.total + e.total,
    hr_pct: ab.total > 0 ? hr.total / ab.total : null,
    bb_pct: pa.total > 0 ? bb.total / pa.total : null,
    k_pct: pa.total > 0 ? so.total / pa.total : null,
    iso: ab.total > 0 ? (tb.total - hits.total) / ab.total : null,
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
                  className="px-3 py-3 text-center font-bold bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors uppercase tracking-wide text-xs relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-px before:bg-gray-600 h-12"
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
              className={` ${
                highlight_condition &&
                parseFloat(row.getValue(highlight_condition)) >
                  highlight_gte_value
                  ? "bg-blue-50"
                  : "bg-white"
              } hover:bg-orange-50 transition-colors`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 text-center border border-gray-200 font-mono text-gray-800 h-12"
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
                className={`px-3 py-2 text-center border border-gray-200 font-mono text-gray-800 bg-gray-100 h-12 ${
                  column.getIsVisible() ? "" : "hidden"
                }`}
              >
                {column.id === "player_name"
                  ? "SEASON TOTALS"
                  : column.id === "jersey_number"
                  ? table.getRowModel().rows.length
                  : column.id === "total_avg" || column.id === "avg"
                  ? averages.total_avg.toFixed(3).replace(/^0+/, "")
                  : column.id === "total_era" || column.id === "era"
                  ? averages.total_era != null
                    ? averages.total_era.toFixed(2)
                    : null
                  : column.id === "total_obp" || column.id === "obp"
                  ? averages.total_obp != null
                    ? averages.total_obp.toFixed(3).replace(/^0+/, "")
                    : "--"
                  : column.id === "total_slg" || column.id === "slg"
                  ? averages.total_slg != null
                    ? averages.total_slg.toFixed(3).replace(/^0+/, "")
                    : "--"
                  : column.id === "total_ops" || column.id === "ops"
                  ? averages.total_obp != null && averages.total_slg != null
                    ? (averages.total_obp + averages.total_slg)
                        .toFixed(3)
                        .replace(/^0+/, "")
                    : "--"
                  : column.id === "total_iso" || column.id === "iso"
                  ? averages.iso != null
                    ? averages.iso.toFixed(3).replace(/^0+/, "")
                    : "--"
                  : column.id === "hrpct"
                  ? averages.hr_pct != null
                    ? (averages.hr_pct * 100).toFixed(2) + "%"
                    : "--"
                  : column.id === "bbpct"
                  ? averages.bb_pct != null
                    ? (averages.bb_pct * 100).toFixed(2) + "%"
                    : "--"
                  : column.id === "kpct"
                  ? averages.k_pct != null
                    ? (averages.k_pct * 100).toFixed(2) + "%"
                    : "--"
                  : column.id === "total_kp9" || column.id === "kp9"
                  ? averages.total_kp9.toFixed(2)
                  : column.id === "ip" || column.id === "total_ip"
                  ? (
                      Math.floor(outs.total / 3) +
                      (outs.total % 3) * 0.1
                    ).toFixed(1)
                  : column.id === "cum_fcpt" || column.id === "fcpt"
                  ? a.total + po.total + e.total > 0
                    ? ((a.total + po.total) / (a.total + po.total + e.total))
                        .toFixed(3)
                        .replace(/^0+/, "")
                    : "--"
                  : column.id === "total_babip" || column.id === "babip"
                  ? averages.total_babip != null
                    ? averages.total_babip.toFixed(3).replace(/^0+/, "")
                    : "--"
                  : column.id === "total_abphr" || column.id === "ab_per_hr"
                  ? averages.total_ab_per_hr != null
                    ? averages.total_ab_per_hr.toFixed(1)
                    : "--"
                  : column.id === "sb_att"
                  ? `${sb.total}-${sb.total + cs.total}`
                  : column.id === "h_ab"
                  ? `${hits.total}-${ab.total}`
                  : column.id === "tc" || column.id === "TC"
                  ? averages.total_chances
                  : typeof totals[column.id] === "number"
                  ? typeof column.columnDef.cell === "function" &&
                    column.columnDef.cell.toString().includes("toFixed")
                    ? totals[column.id].toFixed(1)
                    : totals[column.id]
                  : ""}
              </td>
            ))}
          </tr>
          <tr className="bg-green-200 font-semibold border-t-2 border-gray-400">
            {table.getAllFlatColumns().map((column) => (
              <td
                key={column.id}
                className={`px-3 py-2 text-center border border-gray-200 font-mono text-gray-800 bg-gray-100 h-12 ${
                  column.getIsVisible() ? "" : "hidden"
                }`}
              >
                {column.id === "player_name"
                  ? "SELECTED SPAN TOTALS"
                  : column.id === "jersey_number"}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DislayTable;
