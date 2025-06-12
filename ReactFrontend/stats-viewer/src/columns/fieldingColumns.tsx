import type { FieldingStat, AllFieldingStatByPlayer } from "../types/statTypes";
import {
  type ColumnHelper,
  type HeaderContext,
  type Row,
} from "@tanstack/table-core";
import { getColumnSum } from "../helpers/miscHelpers";
import { dateFilterFn } from "../helpers/filterFns";

const dot_and_three_decimals = (value: number) => {
  const rounded = value.toFixed(3);
  return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
};

export const createFieldingColumns = (helper: ColumnHelper<FieldingStat>) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  helper.accessor("opponent", {
    header: "Opponent",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("game_result", {
    header: "RESULT",
    cell: (info: any) => (
      <a
        href={info.row.original.box_score_link}
        className="text-blue-600 hover:underline"
      >
        {info.getValue()}
      </a>
    ),
    sortDescFirst: true,
  }),
  helper.accessor("player_position", {
    header: "POS",
    cell: (info: any) => info.getValue(),
  }),
  {
    header: "TC",
    id: "tc",
    accessorFn: (row: any) => row.po + row.a + row.e,
    cell: (info: any) => info.getValue(),
  },
  helper.accessor("po", {
    header: "PO",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("a", {
    header: "A",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("e", {
    header: "E",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("cum_fcpt", {
    header: "FPCT",
    cell: (info: any) => {
      return info.getValue() > 0
        ? dot_and_three_decimals(info.getValue())
        : "--";
    },
  }),
  helper.accessor("dp", {
    header: "DP",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("tp", {
    header: "TP",
    cell: (info: any) => info.getValue(),
  }),
];

export const createTotalFieldingByPlayerColumns = (
  helper: ColumnHelper<AllFieldingStatByPlayer>
) => [
  helper.accessor("jersey_number", {
    header: "#",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("player_name", {
    header: "Player",
    cell: (info) => (
      <a
        href={`player/${info.row.original.player_id}`}
        className="text-blue-600 hover:underline"
      >
        {info.getValue()}
      </a>
    ),
    footer: "SEASON TOTALS",
  }),
  {
    header: "POS",
    id: "player_position",
    accessorFn: (row: any) => {
      const position_list = row.all_positions[0] as Record<string, number>;
      const mostPlayedPos = { pos: "", count: 0 };
      for (const [key, value] of Object.entries(position_list)) {
        if (value > mostPlayedPos.count && !key.includes("DH")) {
          mostPlayedPos.pos = key;
          mostPlayedPos.count = value;
        }
      }
      return mostPlayedPos.pos.toUpperCase();
    },
    cell: (info: any) => info.getValue(),
    footer: "--",
  },
  helper.accessor("total_player_games", {
    header: "G",
    cell: (info) => info.getValue(),
    footer: (info) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalGames = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_team_games")) ?? 0),
        0
      );
      return totalGames / info.table.getRowCount() || "--";
    },
  }),
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_pa", {
    header: "PA",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  {
    header: "TC",
    id: "tc",
    accessorFn: (row: any) => row.total_po + row.total_a + row.total_e,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalTC = rows.reduce(
        (sum: number, row: Row<AllFieldingStatByPlayer>) =>
          sum +
          (Number(row.getValue("total_po")) ?? 0) +
          (Number(row.getValue("total_a")) ?? 0) +
          (Number(row.getValue("total_e")) ?? 0),
        0
      );
      return totalTC || "--";
    },
  },
  helper.accessor("total_po", {
    header: "PO",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_a", {
    header: "A",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_e", {
    header: "E",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  {
    header: "FPCT",
    id: "fpct",
    accessorFn: (row: any) => {
      const totalTC = row.total_po + row.total_a + row.total_e;
      return totalTC > 0 ? (row.total_po + row.total_a) / totalTC : 0;
    },
    cell: (info: any) => {
      const value = info.getValue();
      return value > 0 ? dot_and_three_decimals(value) : "--";
    },
    footer: (info: HeaderContext<AllFieldingStatByPlayer, string>) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalTC = rows.reduce(
        (sum: number, row: Row<AllFieldingStatByPlayer>) =>
          sum +
          (Number(row.getValue("total_po")) ?? 0) +
          (Number(row.getValue("total_a")) ?? 0) +
          (Number(row.getValue("total_e")) ?? 0),
        0
      );
      const totalPOA = rows.reduce(
        (sum: number, row: Row<AllFieldingStatByPlayer>) =>
          sum +
          (Number(row.getValue("total_po")) ?? 0) +
          (Number(row.getValue("total_a")) ?? 0),
        0
      );
      return totalTC > 0 ? dot_and_three_decimals(totalPOA / totalTC) : "--";
    },
  },
  helper.accessor("total_dp", {
    header: "DP",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_tp", {
    header: "TP",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
];
