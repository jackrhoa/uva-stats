import type { PitchingStat, AllPitchingStat } from "../types/statTypes.tsx";
import type { ColumnHelper } from "@tanstack/react-table";
import { greaterThanOrEqualTo } from "../helpers/filterFns.ts";
import { getColumnSum } from "../helpers/miscHelpers.tsx";

export const createPitcherColumns = (helper: ColumnHelper<PitchingStat>) => [
  helper.accessor("game_date", {
    header: "Game Date",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("opponent", {
    header: "Opponent",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("game_result", {
    header: "Game Result",
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
  helper.accessor("starter", {
    header: "POS",
    cell: (info: any) => (info.getValue() > 0 ? "SP" : "RP"),
  }),
  helper.accessor("decision", {
    header: "DEC",
    cell: (info: any) => info.getValue(),
    sortDescFirst: true,
  }),
  helper.accessor("ip", {
    header: "IP",
    cell: (info: any) => info.getValue(),
    sortDescFirst: true,
  }),
  helper.accessor("h", {
    header: "H",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("r", {
    header: "R",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("er", {
    header: "ER",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("bb", {
    header: "BB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("so", {
    header: "K",
    cell: (info: any) => info.getValue(),
  }),
];

export const createPitchingExtColumns = (
  helper: ColumnHelper<PitchingStat>
) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("opponent", {
    header: "OPPONENT",
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
  helper.accessor("starter", {
    header: "POS",
    cell: (info: any) => (info.getValue() > 0 ? "SP" : "RP"),
  }),
  helper.accessor("decision", {
    header: "DEC",
    cell: (info: any) => info.getValue(),
    sortDescFirst: true,
  }),
  helper.accessor("ip", {
    header: "IP",
    cell: (info: any) => info.getValue(),
    sortDescFirst: true,
  }),
  helper.accessor("h", {
    header: "H",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("r", {
    header: "R",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("er", {
    header: "ER",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hr_allowed", {
    header: "HR",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("bb", {
    header: "BB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("ibb", {
    header: "IBB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("so", {
    header: "K",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hb", {
    header: "HBP",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("balk", {
    header: "BK",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("wp", {
    header: "WP",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("bf", {
    header: "BF",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("doubles_allowed", {
    header: "2B",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("triples_allowed", {
    header: "3B",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sh_allowed", {
    header: "SH",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sf_allowed", {
    header: "SF",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("ir", {
    header: "IR",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("irs", {
    header: "IRS",
    cell: (info: any) => info.getValue(),
  }),
];

export const createTotalPitchingColumns = (
  helper: ColumnHelper<AllPitchingStat>
) => [
  helper.accessor("jersey_number", {
    header: "#",
    cell: (info) => info.getValue(),
    sortDescFirst: true,
  }),
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("player_name", {
    header: "Player",
    cell: (info) => {
      const row = info.row;
      return (
        <a
          href={`/player/${row.original.player_id}`}
          className="text-blue-600 hover:underline"
        >
          {info.getValue()}
        </a>
      );
    },
  }),
  helper.accessor("total_ip", {
    header: "IP",
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    filterFn: greaterThanOrEqualTo,
  }),
  helper.accessor("total_wins", {
    header: "W",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_losses", {
    header: "L",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_games", {
    header: "G",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_starts", {
    header: "GS",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_era", {
    header: "ERA",
    cell: (info) =>
      info.getValue() != null ? info.getValue().toFixed(2) : "--",
    sortDescFirst: true,
  }),
  helper.accessor("total_h", {
    header: "H",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_r", {
    header: "R",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_er", {
    header: "ER",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_bb", {
    header: "BB",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_so", {
    header: "SO",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_bf", {
    header: "BF",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hr_allowed", {
    header: "HR",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_saves", {
    header: "SV",
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
];

export const createTotalPitchingAdvColumns = (
  helper: ColumnHelper<AllPitchingStat>
) => [
  helper.accessor("jersey_number", {
    header: "#",
    cell: (info) => {
      return info.getValue();
    },
  }),
  helper.accessor("player_name", {
    header: "Player",
    cell: (info) => {
      const row = info.row;
      return (
        <a
          href={`/player/${row.original.player_id}`}
          className="text-blue-600 hover:underline"
        >
          {info.getValue()}
        </a>
      );
    },
  }),
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_ip", {
    header: "IP",
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    filterFn: greaterThanOrEqualTo,
  }),
  helper.accessor("total_h", {
    header: "H",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_r", {
    header: "R",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_er", {
    header: "ER",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_bb", {
    header: "BB",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_so", {
    header: "SO",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_bf", {
    header: "BF",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_hr_allowed", {
    header: "HR",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_games", {
    header: "G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_starts", {
    header: "GS",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_era", {
    header: "ERA",
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(2) : "--",
    sortDescFirst: false,
  }),
  helper.accessor("total_whip", {
    header: "WHIP",
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(3) : "--",
    sortDescFirst: false,
  }),
  {
    header: "H/9",
    id: "h_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * row.total_h) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    sortDescFirst: false,
  },
  {
    header: "BB/9",
    id: "bb_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * row.total_bb) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    sortDescFirst: false,
  },
  {
    header: "K/9",
    id: "k_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * parseInt(row.total_so)) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    sortDescFirst: false,
  },
  {
    header: "HR/9",
    id: "hr_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * parseInt(row.total_hr_allowed)) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    sortDescFirst: false,
  },
  {
    header: "K/BB",
    id: "k_bb",
    accessorFn: (row: any) => {
      return row.total_bb > 0 ? row.total_so / row.total_bb : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    sortDescFirst: true,
  },
];
