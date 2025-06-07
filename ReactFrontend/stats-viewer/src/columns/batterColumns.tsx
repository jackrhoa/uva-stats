import { useMemo } from "react";
import { type ColumnHelper, createColumnHelper } from "@tanstack/react-table";
import type { BattingStat, AllBattingStat } from "../types/statTypes.tsx";
import { dashStatSortingFn } from "../helpers/sortingFns.ts";
import { dot_and_three_decimals } from "../helpers/miscHelpers.tsx";
export const createBatterGameLogColumns = (
  helper: ColumnHelper<BattingStat>
) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: (row, columnId, filterValue: Array<Date>) => {
      if (!filterValue || filterValue.length !== 2) {
        return true;
      }
      const [filterStart, filterEnd] = filterValue;
      const date = new Date(row.getValue(columnId));
      const startDate = new Date(filterStart);
      const endDate = new Date(filterEnd);
      return date >= startDate && date <= endDate;
    },
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
  helper.accessor("player_position", {
    header: "POS",
    cell: (info: any) => info.getValue(),
  }),
  {
    header: "H-AB",
    id: "h_ab",
    accessorFn: (row: any) =>
      typeof row.hits === "number" && typeof row.ab === "number"
        ? `${row.hits}-${row.ab}`
        : null,
    cell: (info: any) => info.getValue(),
    sortingFn: dashStatSortingFn,
    sortDescFirst: true,
  },
  helper.accessor("ab", {
    header: "AB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hits", {
    header: "H",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("runs", {
    header: "R",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("rbi", {
    header: "RBI",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("double", {
    header: "2B",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hr", {
    header: "HR",
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
  helper.accessor("hbp", {
    header: "HBP",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sb", {
    header: "SB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("cs", {
    header: "CS",
    cell: (info: any) => info.getValue(),
  }),
  {
    header: "SB-ATT",
    id: "sb_att",
    accessorFn: (row: any) =>
      row.sb != null && row.cs != null ? `${row.sb}-${row.sb + row.cs}` : null,
    cell: (info: any) =>
      `${info.row.original.sb}-${info.row.original.sb + info.row.original.cs}`,
    sortingFn: dashStatSortingFn,
    sortDescFirst: true,
  },
];

export const createExtBattingColumns = (helper: ColumnHelper<BattingStat>) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: (row, columnId, filterValue: Array<Date>) => {
      if (!filterValue || filterValue.length !== 2) {
        return true;
      }
      const [filterStart, filterEnd] = filterValue;
      const date = new Date(row.getValue(columnId));
      const startDate = new Date(filterStart);
      const endDate = new Date(filterEnd);
      return date >= startDate && date <= endDate;
    },
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
  helper.accessor("player_position", {
    header: "POS",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("pa", {
    header: "PA",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("ab", {
    header: "AB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("runs", {
    header: "R",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hits", {
    header: "H",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("double", {
    header: "2B",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("triple", {
    header: "3B",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hr", {
    header: "HR",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("rbi", {
    header: "RBI",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sb", {
    header: "SB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("cs", {
    header: "CS",
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
  helper.accessor("tb", {
    header: "TB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("dp", {
    header: "DP",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hbp", {
    header: "HBP",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sh", {
    header: "SH",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sf", {
    header: "SF",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("ibb", {
    header: "IBB",
    cell: (info: any) => info.getValue(),
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
        href={`player/${info.row.original.player_id}`}
        className="text-blue-600 hover:underline"
      >
        {info.getValue()}
      </a>
    ),
  }),
  {
    header: "POS",
    id: "player_position",
    accessorFn: (row: any) => {
      const position_list = row.player_position[0] as Record<string, number>;
      const mostPlayedPos = { pos: "", count: 0 };
      for (const [key, value] of Object.entries(position_list)) {
        if (value > mostPlayedPos.count) {
          mostPlayedPos.pos = key;
          mostPlayedPos.count = value; // Return the first position with a value greater than 0
        }
      }
      return mostPlayedPos.pos.toUpperCase(); // Return "N/A" if no position has a value greater than 0
      // row.player_position["SS"],
    },
    cell: (info: any) => info.getValue(),
  },
  helper.accessor("games", {
    header: "G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_pa", {
    header: "PA",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_ab", {
    header: "AB",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_runs", {
    header: "R",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_hits", {
    header: "H",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_rbi", {
    header: "RBI",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("avg", {
    header: "AVG",
    cell: (info) => dot_and_three_decimals(info.getValue()),
  }),
  helper.accessor("total_double", {
    header: "2B",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_triple", {
    header: "3B",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_hr", {
    header: "HR",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_bb", {
    header: "BB",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_strikeouts", {
    header: "SO",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_sb", {
    header: "SB",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_cs", {
    header: "CS",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_hbp", {
    header: "HBP",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_dp", {
    header: "DP",
    cell: (info) => info.getValue(),
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
        href={`/player/${info.row.original.player_id}`}
        className="text-blue-600 hover:underline"
      >
        {info.getValue()}
      </a>
    ),
  }),
  helper.accessor("games", {
    header: "G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_pa", {
    header: "PA",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("avg", {
    header: "AVG",
    cell: (info) => dot_and_three_decimals(info.getValue()),
  }),
  helper.accessor("ops", {
    header: "OPS",
    cell: (info) => dot_and_three_decimals(info.getValue()),
  }),
  helper.accessor("obp", {
    header: "OBP",
    cell: (info) => dot_and_three_decimals(info.getValue()),
  }),
  helper.accessor("slg", {
    header: "SLG",
    cell: (info) => dot_and_three_decimals(info.getValue()),
  }),
  {
    header: "HR%",
    id: "hr_pct",
    accessorFn: (row: any) => row.total_hr / row.total_ab,
    cell: (info: any) => {
      const hr = info.row.original.total_hr;
      const pa = info.row.original.total_pa;
      return pa > 0 ? ((hr / pa) * 100).toFixed(2) + "%" : "--";
    },
  },
  {
    header: "BB%",
    id: "bb_pct",
    accessorFn: (row: any) => row.total_bb / row.total_pa,
    cell: (info: any) => {
      const bb = info.row.original.total_bb;
      const pa = info.row.original.total_pa;
      return pa > 0 ? ((bb / pa) * 100).toFixed(2) + "%" : "--";
    },
  },
  {
    header: "K%",
    id: "k_pct",
    accessorFn: (row: any) => row.total_strikeouts / row.total_pa,
    cell: (info: any) => {
      const k = info.row.original.total_strikeouts;
      const pa = info.row.original.total_pa;
      return pa > 0 ? ((k / pa) * 100).toFixed(2) + "%" : "--";
    },
    sortDescFirst: false,
  },
  {
    header: "ISO",
    id: "iso",
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
  },
  {
    header: "BABIP",
    id: "babip",
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
