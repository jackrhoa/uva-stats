import type { FieldingStat } from "../types/statTypes";
import { type ColumnHelper } from "@tanstack/table-core";

const dot_and_three_decimals = (value: number) => {
  const rounded = value.toFixed(3);
  return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
};

export const createFieldingColumns = (helper: ColumnHelper<FieldingStat>) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
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
