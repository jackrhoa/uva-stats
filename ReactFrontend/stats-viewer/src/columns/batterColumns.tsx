import { type ColumnHelper } from "@tanstack/react-table";
import type {
  BattingStat,
  AllBattingStat,
  BattingSituationalStat,
} from "../types/statTypes.tsx";
import { dashStatSortingFn } from "../helpers/sortingFns.ts";
import { dot_and_three_decimals } from "../helpers/miscHelpers.tsx";
import { getColumnSum, min_plate_appearance } from "../helpers/miscHelpers.tsx";
import { compareOperatorFilterFn, dateFilterFn } from "../helpers/filterFns.ts";

import { type BattingSeasonStat } from "../helpers/aggregateStats.ts";

export const createBatterGameLogColumns = (
  helper: ColumnHelper<BattingStat>
) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  {
    header: "H/A",
    id: "home_away",
    accessorFn: (row: any) => (row.home ? "H" : "A"),
    cell: (info: any) => info.getValue(),
  },
  helper.accessor("opponent_name", {
    header: "OPPONENT NAME!",
    cell: (info: any) => {
      const home = info.row.original.home;
      // console.log("Home:", home);
      // const home = false;
      return home != null && !home
        ? "@ " + info.getValue()
        : "vs " + info.getValue();
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalGames = rows.length;
      return `${totalGames} GP`;
    },
  }),
  helper.accessor("pa", {
    header: "PA",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("tb", {
    header: "TB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("dp", {
    header: "DP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hbp", {
    header: "HBP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sh", {
    header: "SH",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sf", {
    header: "SF",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("ibb", {
    header: "IBB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
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
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalGames = rows.length;
      const wins = rows.filter((row: any) =>
        row.getValue("game_result").includes("W")
      ).length;
      return `${wins}-${totalGames - wins}`;
    },
    sortDescFirst: true,
  }),
  helper.accessor("player_position", {
    header: "POS",
    cell: (info: any) => info.getValue(),
    footer: "--",
  }),
  {
    header: "H-AB",
    id: "h_ab",
    accessorFn: (row: any) =>
      typeof row.hits === "number" && typeof row.ab === "number"
        ? `${row.hits}-${row.ab}`
        : null,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalHits = rows.reduce(
        (sum: number, row: any) => sum + (Number(row.getValue("hits")) ?? 0),
        0
      );
      const totalAB = rows.reduce(
        (sum: number, row: any) => sum + (Number(row.getValue("ab")) ?? 0),
        0
      );
      return totalAB > 0
        ? `${totalHits}-${totalAB} (${dot_and_three_decimals(
            totalHits / totalAB
          )})`
        : "--";
    },
    sortingFn: dashStatSortingFn,
    sortDescFirst: true,
  },
  helper.accessor("ab", {
    header: "AB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hits", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("runs", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("rbi", {
    header: "RBI",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("double", {
    header: "2B",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hr", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("so", {
    header: "K",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hbp", {
    header: "HBP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sb", {
    header: "SB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("cs", {
    header: "CS",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  {
    header: "SB-ATT",
    id: "sb_att",
    accessorFn: (row: any) =>
      row.sb != null && row.cs != null ? `${row.sb}-${row.sb + row.cs}` : null,
    cell: (info: any) =>
      `${info.row.original.sb}-${info.row.original.sb + info.row.original.cs}`,
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalSB = rows.reduce(
        (sum: number, row: any) => sum + (Number(row.getValue("sb")) ?? 0),
        0
      );
      const totalCS = rows.reduce(
        (sum: number, row: any) => sum + (Number(row.getValue("cs")) ?? 0),
        0
      );
      return totalCS + totalSB > 0 ? `${totalSB}-${totalSB + totalCS}` : "--";
    },
    sortingFn: dashStatSortingFn,
    sortDescFirst: true,
  },
];

export const createExtBattingColumns = (helper: ColumnHelper<BattingStat>) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  helper.accessor("opponent_name", {
    header: "OPPONENT",
    cell: (info: any) => {
      const home = info.row.original.home;
      // console.log("Home:", home);
      // const home = false;
      return home != null && !home
        ? "@ " + info.getValue()
        : "vs " + info.getValue();
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalGames = rows.length;
      return `${totalGames} GP`;
    },
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
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalGames = rows.length;
      const wins = rows.filter((row: any) =>
        row.getValue("game_result").includes("W")
      ).length;
      return `${wins}-${totalGames - wins}`;
    },
    sortDescFirst: true,
  }),
  helper.accessor("player_position", {
    header: "POS",
    cell: (info: any) => info.getValue(),
    footer: "--",
  }),
  helper.accessor("pa", {
    header: "PA",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("ab", {
    header: "AB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("runs", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hits", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("double", {
    header: "2B",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("triple", {
    header: "3B",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hr", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("rbi", {
    header: "RBI",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sb", {
    header: "SB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("cs", {
    header: "CS",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("so", {
    header: "K",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("tb", {
    header: "TB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("dp", {
    header: "DP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hbp", {
    header: "HBP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sh", {
    header: "SH",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sf", {
    header: "SF",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("ibb", {
    header: "IBB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info: any) => getColumnSum(info, info.column.id),
  }),
];

export const createTotalBattingColumns = (
  helper: ColumnHelper<AllBattingStat>
) => [
  helper.accessor("jersey_number", {
    header: "#",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("player_name", {
    header: "Player",
    cell: (info) => (
      <a
        href={`player/${info.row.original.player_id}?toggle=1`}
        className="text-blue-600 hover:underline"
      >
        {info.getValue()}
      </a>
    ),
    footer: "SEASON TOTALS",
  }),
  {
    id: "qualified",
    accessorFn: (row: any) =>
      row.total_pa / min_plate_appearance > row.total_team_games,
    header: "Qualified?",
    cell: (info: any) => {
      const qualified = info.getValue();
      return qualified ? "Qualified" : "Not Qualified";
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    header: "POS",
    id: "player_position",
    accessorFn: (row: any) => {
      const position_list = row.player_position[0] as Record<string, number>;
      const mostPlayedPos = { pos: "", count: 0 };
      for (const [key, value] of Object.entries(position_list)) {
        if (value > mostPlayedPos.count) {
          mostPlayedPos.pos = key;
          mostPlayedPos.count = value;
        }
      }
      return mostPlayedPos.pos.toUpperCase();
    },
    cell: (info: any) => info.getValue(),
    footer: "--",
  },
  helper.accessor("games", {
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
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_ab", {
    header: "AB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_runs", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hits", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_rbi", {
    header: "RBI",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),

  helper.accessor("avg", {
    header: "AVG",
    filterFn: compareOperatorFilterFn,
    cell: (info) => dot_and_three_decimals(info.getValue()),
    footer: (info) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalH = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_hits")) ?? 0),
        0
      );
      const totalAB = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_ab")) ?? 0),
        0
      );
      return totalAB > 0 ? dot_and_three_decimals(totalH / totalAB) : "--";
    },
  }),
  helper.accessor("total_double", {
    header: "2B",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hr", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_strikeouts", {
    header: "SO",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_sb", {
    header: "SB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_cs", {
    header: "CS",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hbp", {
    header: "HBP",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
];

export const createTotalBattingAdvColumns = (
  helper: ColumnHelper<AllBattingStat>
) => [
  helper.accessor("jersey_number", {
    header: "#",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("player_name", {
    header: "Player",
    cell: (info) => (
      <a
        href={`/player/${info.row.original.player_id}?toggle=1`}
        className="text-blue-600 hover:underline"
      >
        {info.getValue()}
      </a>
    ),
    footer: "SEASON TOTALS",
  }),
  {
    id: "qualified",
    accessorFn: (row: any) =>
      row.total_pa / min_plate_appearance > row.total_team_games,
    header: "Qualified?",
    cell: (info: any) => {
      const qualified = info.getValue();
      return qualified ? "Qualified" : "Not Qualified";
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    header: "POS",
    id: "player_position",
    accessorFn: (row: any) => {
      const position_list = row.player_position[0] as Record<string, number>;
      const mostPlayedPos = { pos: "", count: 0 };
      for (const [key, value] of Object.entries(position_list)) {
        if (value > mostPlayedPos.count) {
          mostPlayedPos.pos = key;
          mostPlayedPos.count = value;
        }
      }
      return mostPlayedPos.pos.toUpperCase();
    },
    cell: (info: any) => info.getValue(),
    footer: "--",
  },
  helper.accessor("total_ab", {
    header: "AB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_runs", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hits", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_rbi", {
    header: "RBI",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),

  helper.accessor("total_double", {
    header: "2B",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hr", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_strikeouts", {
    header: "SO",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_sb", {
    header: "SB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_cs", {
    header: "CS",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_ibb", {
    header: "IBB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_sf", {
    header: "SF",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_triple", {
    header: "3B",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hbp", {
    header: "HBP",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("games", {
    header: "G",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_pa", {
    header: "PA",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("avg", {
    header: "AVG",
    filterFn: compareOperatorFilterFn,
    cell: (info) => dot_and_three_decimals(info.getValue()),
    footer: (info) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalH = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_hits")) ?? 0),
        0
      );
      const totalAB = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_ab")) ?? 0),
        0
      );
      return totalAB > 0 ? dot_and_three_decimals(totalH / totalAB) : "--";
    },
  }),
  helper.accessor("ops", {
    header: "OPS",
    filterFn: compareOperatorFilterFn,
    cell: (info) => dot_and_three_decimals(info.getValue()),
    footer: (info) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalOB = rows.reduce(
        (sum, row) =>
          sum +
          (Number(row.getValue("total_hits")) ?? 0) +
          (Number(row.getValue("total_bb")) ?? 0) +
          (Number(row.getValue("total_hbp")) ?? 0),
        0
      );

      const totalOBChances = rows.reduce(
        (sum, row) =>
          sum +
          (Number(row.getValue("total_ab")) ?? 0) +
          (Number(row.getValue("total_bb")) ?? 0) +
          (Number(row.getValue("total_hbp")) ?? 0) +
          (Number(row.getValue("total_sf")) ?? 0),
        0
      );

      const obp = totalOBChances > 0 ? totalOB / totalOBChances : null;

      const total_bases = rows.reduce(
        (sum, row) =>
          sum +
          ((Number(row.getValue("total_hits")) ?? 0) -
            (Number(row.getValue("total_double")) ?? 0) -
            (Number(row.getValue("total_triple")) ?? 0) -
            (Number(row.getValue("total_hr")) ?? 0)) +
          (2 * (Number(row.getValue("total_double")) ?? 0) +
            3 * (Number(row.getValue("total_triple")) ?? 0) +
            4 * (Number(row.getValue("total_hr")) ?? 0)),

        0
      );
      const totalAB = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_ab")) ?? 0),
        0
      );

      const slg = totalAB > 0 ? total_bases / totalAB : null;
      return obp != null && slg != null
        ? dot_and_three_decimals(obp + slg)
        : "--";
    },
  }),
  helper.accessor("obp", {
    header: "OBP",
    filterFn: compareOperatorFilterFn,
    cell: (info) => dot_and_three_decimals(info.getValue()),
    footer: (info) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalOB = rows.reduce(
        (sum, row) =>
          sum +
          (Number(row.getValue("total_hits")) ?? 0) +
          (Number(row.getValue("total_bb")) ?? 0) +
          (Number(row.getValue("total_hbp")) ?? 0),
        // NOT INCLDING IBB because UVA official stats
        // ignore it for OBP and baseball-reference.com
        // does same thing (verified with Aaron Judge stats)
        // on 06/07/2025

        0
      );
      const totalOBChances = rows.reduce(
        (sum, row) =>
          sum +
          (Number(row.getValue("total_ab")) ?? 0) +
          (Number(row.getValue("total_bb")) ?? 0) +
          (Number(row.getValue("total_hbp")) ?? 0) +
          (Number(row.getValue("total_sf")) ?? 0),

        0
      );
      return totalOBChances > 0
        ? dot_and_three_decimals(totalOB / totalOBChances)
        : "--";
    },
  }),
  helper.accessor("slg", {
    header: "SLG",
    filterFn: compareOperatorFilterFn,
    cell: (info) => dot_and_three_decimals(info.getValue()),
    footer: (info) => {
      const rows = info.table.getFilteredRowModel().rows;

      const total_bases = rows.reduce(
        (sum, row) =>
          sum +
          ((Number(row.getValue("total_hits")) ?? 0) -
            (Number(row.getValue("total_double")) ?? 0) -
            (Number(row.getValue("total_triple")) ?? 0) -
            (Number(row.getValue("total_hr")) ?? 0)) +
          (2 * (Number(row.getValue("total_double")) ?? 0) +
            3 * (Number(row.getValue("total_triple")) ?? 0) +
            4 * (Number(row.getValue("total_hr")) ?? 0)),

        0
      );
      const totalAB = rows.reduce(
        (sum, row) => sum + (Number(row.getValue("total_ab")) ?? 0),
        0
      );
      return totalAB > 0 ? dot_and_three_decimals(total_bases / totalAB) : "--";
    },
  }),
  {
    header: "HR%",
    id: "hr_pct",
    filterFn: compareOperatorFilterFn,
    accessorFn: (row: any) => row.total_hr / row.total_ab,
    cell: (info: any) => {
      const hr = info.row.original.total_hr;
      const pa = info.row.original.total_pa;
      return pa > 0 ? ((hr / pa) * 100).toFixed(2) + "%" : "--";
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalHR = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_hr")) ?? 0),
        0
      );
      const totalPA = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_pa")) ?? 0),
        0
      );
      return totalPA > 0 ? ((totalHR / totalPA) * 100).toFixed(1) + "%" : "--";
    },
  },
  {
    header: "BB%",
    id: "bb_pct",
    filterFn: compareOperatorFilterFn,
    accessorFn: (row: any) => row.total_bb / row.total_pa,
    cell: (info: any) => {
      const bb = info.row.original.total_bb;
      const pa = info.row.original.total_pa;
      return pa > 0 ? ((bb / pa) * 100).toFixed(2) + "%" : "--";
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalBB = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_bb")) ?? 0),
        0
      );
      const totalPA = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_pa")) ?? 0),
        0
      );
      return totalPA > 0 ? ((totalBB / totalPA) * 100).toFixed(1) + "%" : "--";
    },
  },
  {
    header: "K%",
    id: "k_pct",
    filterFn: compareOperatorFilterFn,
    accessorFn: (row: any) => row.total_strikeouts / row.total_pa,
    cell: (info: any) => {
      const k = info.row.original.total_strikeouts;
      const pa = info.row.original.total_pa;
      return pa > 0 ? ((k / pa) * 100).toFixed(2) + "%" : "--";
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalK = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_strikeouts")) ?? 0),
        0
      );
      const totalPA = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_pa")) ?? 0),
        0
      );
      return totalPA > 0 ? ((totalK / totalPA) * 100).toFixed(1) + "%" : "--";
    },
    sortDescFirst: false,
  },
  {
    header: "ISO",
    id: "iso",
    filterFn: compareOperatorFilterFn,
    accessorFn: (row: any) => {
      const totalDoubles = row.total_double;
      const totalTriples = row.total_triple;
      const totalHomeRuns = row.total_hr;
      const totalAtBats = row.total_ab;
      return totalAtBats > 0
        ? (totalDoubles + 2 * totalTriples + 3 * totalHomeRuns) / totalAtBats
        : null;
    },
    cell: (info: any) => {
      const iso = info.getValue();
      return iso != null ? dot_and_three_decimals(iso) : "--";
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;

      const total_bases = rows.reduce(
        (sum: number, row: any) =>
          sum +
          ((Number(row.getValue("total_hits")) ?? 0) -
            (Number(row.getValue("total_double")) ?? 0) -
            (Number(row.getValue("total_triple")) ?? 0) -
            (Number(row.getValue("total_hr")) ?? 0)) +
          (2 * (Number(row.getValue("total_double")) ?? 0) +
            3 * (Number(row.getValue("total_triple")) ?? 0) +
            4 * (Number(row.getValue("total_hr")) ?? 0)),

        0
      );

      const totalHits = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_hits")) ?? 0),
        0
      );
      const totalAB = rows.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.getValue("total_ab")) ?? 0),
        0
      );
      return totalAB > 0
        ? dot_and_three_decimals((total_bases - totalHits) / totalAB)
        : "--";
    },
  },
  {
    header: "BABIP",
    id: "babip",
    filterFn: compareOperatorFilterFn,
    accessorFn: (row: any) => {
      const totalHits = row.total_hits;
      const totalAtBats = row.total_ab;
      const totalSacFlies = row.total_sf;
      const totalStrikeouts = row.total_strikeouts;
      const totalHomeRuns = row.total_hr;
      return totalAtBats > 0
        ? (totalHits - totalHomeRuns) /
            (totalAtBats - totalStrikeouts - totalHomeRuns + totalSacFlies)
        : null;
    },
    cell: (info: any) => {
      const babip = info.getValue();
      return babip != null ? dot_and_three_decimals(babip) : "--";
    },
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;

      const totalNumerator = rows.reduce(
        (sum: number, row: any) =>
          sum +
          Number(row.getValue("total_hits")) -
          Number(row.getValue("total_hr")),
        0
      );
      const totalDenominator = rows.reduce(
        (sum: number, row: any) =>
          sum +
          (Number(row.getValue("total_ab")) ?? -1000) -
          (Number(row.getValue("total_hr")) ?? -1000) -
          (Number(row.getValue("total_strikeouts")) ?? -1000) +
          (Number(row.getValue("total_sf")) ?? -1000),
        0
      );
      return totalDenominator > 0
        ? dot_and_three_decimals(totalNumerator / totalDenominator)
        : "--";
    },
  },
  // {
  //   header: "AB/HR",
  //   id: "ab_per_hr",
  //   accessorFn: (row: any) => {
  //     const totalAtBats = row.total_ab;
  //     const totalHomeRuns = row.total_hr;
  //     return totalHomeRuns > 0 ? totalAtBats / totalHomeRuns : null;
  //   },
  //   cell: (info: any) => {
  //     const abPerHr = info.getValue();
  //     return abPerHr != null ? abPerHr.toFixed(1) : "--";
  //   },
  //   // sortDescFirst: true,
  //   sortingFn: (rowA: any, rowB: any) => {
  //     const abPerHrA = rowA.getValue("ab_per_hr");
  //     const abPerHrB = rowB.getValue("ab_per_hr");

  //     if (abPerHrA === null || abPerHrA === undefined) return -1; // Treat null/undefined as greater
  //     if (abPerHrB === null || abPerHrB === undefined) return 1; // Treat null/undefined as greater

  //     return abPerHrB - abPerHrA; // Ascending order
  //   },
  // },
];

export const createTotalIndivBattingColumns = (
  helper: ColumnHelper<BattingSeasonStat>
) => [
  helper.accessor("player_name", {
    header: "#",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hr", {
    header: "HR",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("player_position", {
    header: "POS",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("games_played", {
    header: "G",
    cell: (info: any) => info.getValue(),
  }),
];

export const createBatterSituationalColumns = (
  helper: ColumnHelper<BattingSituationalStat>
) => [
  helper.accessor("hits_with_risp.H", {
    header: "H",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  helper.accessor("hits_with_risp.AB", {
    header: "AB",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  // {
  //   header: "H/A",
  //   id: "home_away",
  //   accessorFn: (row: any) => (row.home ? "H" : "A"),
  //   cell: (info: any) => info.getValue(),
  // },
  // helper.accessor("opponent_name", {
  //   header: "OPPONENT",
  //   cell: (info: any) => {
  //     const home = info.row.original.home;
  //     // console.log("Home:", home);
  //     // const home = false;
  //     return home != null && !home
  //       ? "@ " + info.getValue()
  //       : "vs " + info.getValue();
  //   },
  //   footer: (info: any) => {
  //     const rows = info.table.getFilteredRowModel().rows;
  //     const totalGames = rows.length;
  //     return `${totalGames} GP`;
  //   },
  // }),
  // helper.accessor("pa", {
  //   header: "PA",
  //   filterFn: compareOperatorFilterFn,
  //   cell: (info: any) => info.getValue(),
  //   footer: (info: any) => getColumnSum(info, info.column.id),
  // }),
];
