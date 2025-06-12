import type { PitchingStat, AllPitchingStat } from "../types/statTypes.tsx";
import type { ColumnHelper } from "@tanstack/react-table";
import { compareOperatorFilterFn, dateFilterFn } from "../helpers/filterFns.ts";
import { getColumnSum, min_innings_pitched } from "../helpers/miscHelpers.tsx";

export const createPitcherColumns = (helper: ColumnHelper<PitchingStat>) => [
  helper.accessor("game_date", {
    header: "Game Date",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  helper.accessor("opponent", {
    header: "Opponent",
    cell: (info: any) => info.getValue(),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const totalGames = rows.length;
      return `${totalGames} GP`;
    },
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
  helper.accessor("starter", {
    header: "POS",
    cell: (info: any) => (info.getValue() > 0 ? "SP" : "RP"),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const starters = rows.filter(
        (row: any) => row.getValue("starter") > 0
      ).length;
      return `${starters} GS`;
    },
  }),
  helper.accessor("decision", {
    header: "DEC",
    cell: (info: any) => info.getValue(),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const wins = rows.filter((row: any) =>
        row.getValue("decision").includes("W")
      ).length;
      const losses = rows.filter((row: any) =>
        row.getValue("decision").includes("L")
      ).length;
      const saves = rows.filter((row: any) =>
        row.getValue("decision").includes("S")
      ).length;
      const save_count = saves > 0 ? `, ${saves} SV` : "";
      return `${wins}-${losses}${save_count}`;
    },
    sortDescFirst: true,
  }),
  {
    header: "IP",
    filterFn: compareOperatorFilterFn,
    id: "ip",
    accessorFn: (row: any) => parseFloat(row.ip),
    cell: (info: any) => {
      const ipValue = info.getValue();
      return typeof ipValue === "number" ? ipValue.toFixed(1) : "--";
    },
    footer: (info: any) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = parseFloat(row.getValue("ip"));
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      return totalOuts > 0
        ? (Math.floor(totalOuts / 3) + (totalOuts % 3) * 0.1).toFixed(1)
        : "--";
    },
    sortDescFirst: true,
  },
  helper.accessor("h", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("r", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("er", {
    header: "ER",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("so", {
    header: "K",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
];

export const createPitchingExtColumns = (
  helper: ColumnHelper<PitchingStat>
) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: dateFilterFn,
  }),
  helper.accessor("opponent", {
    header: "OPPONENT",
    cell: (info: any) => info.getValue(),
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
  helper.accessor("starter", {
    header: "POS",
    cell: (info: any) => (info.getValue() > 0 ? "SP" : "RP"),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const starters = rows.filter(
        (row: any) => row.getValue("starter") > 0
      ).length;
      return `${starters} GS`;
    },
  }),
  helper.accessor("decision", {
    header: "DEC",
    cell: (info: any) => info.getValue(),
    footer: (info: any) => {
      const rows = info.table.getFilteredRowModel().rows;
      const wins = rows.filter((row: any) =>
        row.getValue("decision").includes("W")
      ).length;
      const losses = rows.filter((row: any) =>
        row.getValue("decision").includes("L")
      ).length;
      const saves = rows.filter((row: any) =>
        row.getValue("decision").includes("S")
      ).length;
      const save_count = saves > 0 ? `, ${saves} SV` : "";
      return `${wins}-${losses}${save_count}`;
    },
    sortDescFirst: true,
  }),
  {
    header: "IP",
    filterFn: compareOperatorFilterFn,
    id: "ip",
    accessorFn: (row: any) => parseFloat(row.ip),
    cell: (info: any) => {
      const ipValue = info.getValue();
      return typeof ipValue === "number" ? ipValue.toFixed(1) : "--";
    },
    footer: (info: any) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = parseFloat(row.getValue("ip"));
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      return totalOuts > 0
        ? (Math.floor(totalOuts / 3) + (totalOuts % 3) * 0.1).toFixed(1)
        : "--";
    },
    sortDescFirst: true,
  },
  helper.accessor("h", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("r", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("er", {
    header: "ER",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hr_allowed", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("ibb", {
    header: "IBB",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("so", {
    header: "K",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("hb", {
    header: "HBP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("balk", {
    header: "BK",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("wp", {
    header: "WP",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("bf", {
    header: "BF",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("doubles_allowed", {
    header: "2B",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("triples_allowed", {
    header: "3B",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sh_allowed", {
    header: "SH",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("sf_allowed", {
    header: "SF",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("ir", {
    header: "IR",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("irs", {
    header: "IRS",
    filterFn: compareOperatorFilterFn,
    cell: (info: any) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
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
  {
    id: "qualified",
    accessorFn: (row: any) =>
      row.total_ip / min_innings_pitched >= row.total_team_games,
    header: "Qualified?",
    cell: (info: any) => {
      const qualified = info.getValue();
      return qualified ? "Qualified" : "Not Qualified";
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
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
    filterFn: compareOperatorFilterFn,
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    // filterFn: greaterThanOrEqualTo,
    footer: (info) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      return totalOuts > 0
        ? (Math.floor(totalOuts / 3) + (totalOuts % 3) * 0.1).toFixed(1)
        : "--";
    },
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
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_era", {
    header: "ERA",
    filterFn: compareOperatorFilterFn,
    cell: (info) =>
      info.getValue() != null ? info.getValue().toFixed(2) : "--",
    footer: (info) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalEr = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const erValue = row.getValue("total_er");
          return sum + (typeof erValue === "number" ? erValue : 0);
        }, 0);
      return totalOuts > 0 ? ((totalEr * 27) / totalOuts).toFixed(2) : "--";
    },
    sortDescFirst: true,
  }),
  helper.accessor("total_h", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_r", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_er", {
    header: "ER",
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
  helper.accessor("total_so", {
    header: "K",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_bf", {
    header: "BF",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_hr_allowed", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_saves", {
    header: "SV",
    filterFn: compareOperatorFilterFn,
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
  {
    id: "qualified",
    accessorFn: (row: any) =>
      row.total_ip / min_innings_pitched >= row.total_team_games,
    header: "Qualified?",
    cell: (info: any) => {
      const qualified = info.getValue();
      return qualified ? "Qualified" : "Not Qualified";
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  helper.accessor("total_team_games", {
    header: "Team G",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_ip", {
    header: "IP",
    filterFn: compareOperatorFilterFn,
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    footer: (info) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      return totalOuts > 0
        ? (Math.floor(totalOuts / 3) + (totalOuts % 3) * 0.1).toFixed(1)
        : "--";
    },
  }),
  helper.accessor("total_h", {
    header: "H",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_r", {
    header: "R",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_er", {
    header: "ER",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_bb", {
    header: "BB",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_so", {
    header: "K",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_bf", {
    header: "BF",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_hr_allowed", {
    header: "HR",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
  }),
  helper.accessor("total_games", {
    header: "G",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: "--",
  }),
  helper.accessor("total_starts", {
    header: "GS",
    filterFn: compareOperatorFilterFn,
    cell: (info) => info.getValue(),
    footer: (info) => getColumnSum(info, info.column.id),
  }),
  helper.accessor("total_era", {
    header: "ERA",
    filterFn: compareOperatorFilterFn,
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(2) : "--",
    footer: (info) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalEr = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const erValue = row.getValue("total_er");
          return sum + (typeof erValue === "number" ? erValue : 0);
        }, 0);
      return totalOuts > 0 ? ((totalEr * 27) / totalOuts).toFixed(2) : "--";
    },
    sortDescFirst: false,
  }),
  helper.accessor("total_whip", {
    header: "WHIP",
    filterFn: compareOperatorFilterFn,
    cell: (info) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(3) : "--",
    footer: (info) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalH = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const hValue = row.getValue("total_h");
          return sum + (typeof hValue === "number" ? hValue : 0);
        }, 0);
      const totalBB = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const bbValue = row.getValue("total_bb");
          return sum + (typeof bbValue === "number" ? bbValue : 0);
        }, 0);
      return totalOuts > 0
        ? ((totalH + totalBB) / (totalOuts / 3)).toFixed(3)
        : "--";
    },
    sortDescFirst: false,
  }),
  {
    header: "H/9",
    filterFn: compareOperatorFilterFn,
    id: "h_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * row.total_h) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    footer: (info: any) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalH = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const hValue = row.getValue("total_h");
          return sum + (typeof hValue === "number" ? hValue : 0);
        }, 0);
      return totalOuts > 0 ? ((totalH * 27) / totalOuts).toFixed(1) : "--";
    },
    sortDescFirst: false,
  },
  {
    header: "BB/9",
    filterFn: compareOperatorFilterFn,
    id: "bb_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * row.total_bb) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    footer: (info: any) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalBB = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const bbValue = row.getValue("total_bb");
          return sum + (typeof bbValue === "number" ? bbValue : 0);
        }, 0);
      return totalOuts > 0 ? ((totalBB * 27) / totalOuts).toFixed(1) : "--";
    },
    sortDescFirst: false,
  },
  {
    header: "K/9",
    filterFn: compareOperatorFilterFn,
    id: "k_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * parseInt(row.total_so)) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(1) : "--",
    footer: (info: any) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalSO = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const soValue = row.getValue("total_so");
          return sum + (typeof soValue === "number" ? soValue : 0);
        }, 0);
      return totalOuts > 0 ? ((totalSO * 27) / totalOuts).toFixed(1) : "--";
    },
    sortDescFirst: false,
  },
  {
    header: "HR/9",
    filterFn: compareOperatorFilterFn,
    id: "hr_9ip",
    accessorFn: (row: any) => {
      const ip: number = parseFloat(row.total_ip);
      const outs = 10 * ip - 7 * Math.floor(ip);
      return outs > 0 ? (27 * parseInt(row.total_hr_allowed)) / outs : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(2) : "--",
    footer: (info: any) => {
      const totalOuts = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const ipValue = row.getValue("total_ip");
          return (
            sum +
            (typeof ipValue === "number"
              ? 10 * ipValue - 7 * Math.floor(ipValue)
              : -1000)
          );
        }, 0);
      const totalHR = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const hrValue = row.getValue("total_hr_allowed");
          return sum + (typeof hrValue === "number" ? hrValue : 0);
        }, 0);
      return totalOuts > 0 ? ((totalHR * 27) / totalOuts).toFixed(2) : "--";
    },
    sortDescFirst: false,
  },
  {
    header: "K/BB",
    filterFn: compareOperatorFilterFn,
    id: "k_bb",
    accessorFn: (row: any) => {
      return row.total_bb > 0 ? row.total_so / row.total_bb : null;
    },
    cell: (info: any) =>
      typeof info.getValue() === "number" ? info.getValue().toFixed(2) : "--",
    footer: (info: any) => {
      const totalBB = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const bbValue = row.getValue("total_bb");
          return sum + (typeof bbValue === "number" ? bbValue : 0);
        }, 0);
      const totalSO = info.table
        .getSortedRowModel()
        .rows.reduce((sum: number, row: any) => {
          const soValue = row.getValue("total_so");
          return sum + (typeof soValue === "number" ? soValue : 0);
        }, 0);
      return totalBB > 0 ? (totalSO / totalBB).toFixed(1) : "--";
    },
    sortDescFirst: true,
  },
];
