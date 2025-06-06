import { useState, useEffect, useMemo } from "react";
import { variables } from "../Variables.tsx";
import usePlayerStats from "../hooks/usePlayerStats.tsx";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { Row, SortingFn, FilterFn } from "@tanstack/react-table";
import ToggleTabs from "./ToggleTabs.tsx";
import DisplayTable from "./DisplayTable.tsx";

const greaterThanOrEqualTo: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);
  return typeof cellValue === "number" && cellValue >= parseFloat(value);
};

const batterSeasonTotalHeader = (
  <div className="flex flex-col gap-2">
    <div>
      <span className="font-bold">Bold</span> denotes a qualified batter (N/A
      plate appearances per team game)
    </div>
  </div>
);

const pitcherSeasonTotalHeader = (
  <div className="flex flex-col gap-2">
    <div>
      <span className="font-bold">Bold</span> denotes a qualified pitcher (N/A
      inning pitched per team game)
    </div>
  </div>
);

const byQualifiedEra: SortingFn<AllPitcherStat> = (
  rowA: Row<AllPitcherStat>,
  rowB: Row<AllPitcherStat>
) => {
  const eraA: number = rowA.getValue("total_era");
  const eraB: number = rowB.getValue("total_era");

  const ipA: number = rowA.getValue("total_ip");
  const ipB: number = rowB.getValue("total_ip");

  const team_games = 50;

  const isQualifiedA = ipA >= team_games;
  const isQualifiedB = ipB >= team_games;

  if (isQualifiedA && isQualifiedB) {
    // Both are qualified, sort by ERA
    return eraA - eraB; // Ascending order
  } else if (isQualifiedA) {
    // A is qualified, B is not
    return -1; // A comes first
  } else if (isQualifiedB) {
    // B is qualified, A is not
    return 1; // B comes first
  }

  // No method currently exists for getting total games for the team, so I'm going to use 50 for now

  if (eraA === null || eraA === undefined) return 1; // Treat null/undefined as greater
  if (eraB === null || eraB === undefined) return -1; // Treat null/undefined as greater

  return eraA - eraB; // Ascending order
};

type AllBatterStat = {
  id: number;
  player_id: number;
  total_hits: number;
  player_name: string;
  jersey_number: number;
  total_ab: number;
  total_pa: number;
  total_runs: number;
  total_rbi: number;
  total_bb: number;
  total_strikeouts: number;
  total_hbp: number;
  total_ibb: number;
  total_sb: number;
  total_cs: number;
  total_dp: number;
  total_double: number;
  total_triple: number;
  total_hr: number;
  total_sf: number;
  total_sh: number;
  total_picked_off: number;
  avg: number;
  obp: number;
  tb: number;
  slg: number;
  ops: number;
  games: number;
};

type AllPitcherStat = {
  id: number;
  player_id: number;
  player_name: string;
  jersey_number: number;
  total_ip: number;
  total_h: number;
  total_r: number;
  total_er: number;
  total_bb: number;
  total_so: number;
  total_bf: number;
  total_doubles_allowed: number;
  total_triples_allowed: number;
  total_hr_allowed: number;
  total_wp: number;
  total_hb: number;
  total_starts: number;
  total_ibb: number;
  total_balk: number;
  total_ir: number;
  total_irs: number;
  total_sh_allowed: number;
  total_sf_allowed: number;
  total_kl: number;
  total_pickoffs: number;
  total_wins: number;
  total_losses: number;
  total_saves: number;
  total_ab: number;
  total_era: number;
  total_whip: number;
  total_games: number;
};

// this can be the Batter specific main page
const AllPlayerStats = () => {
  // const [batterStats, setBatterStats] = useState<AllBatterStat[]>([]);
  // const [pitcherStats, setPitcherStats] = useState<AllPitcherStat[]>([]);
  const [toggle, setToggle] = useState(0);

  const statsToReceive = useMemo(
    () => ["total_batting_stats", "total_pitching_stats"],
    []
  );

  const dot_and_three_decimals = (value: number) => {
    const rounded = value.toFixed(3);
    return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
  };

  const { playerData, loading, error } = usePlayerStats({
    API_BASE_URL: variables.API_BASE_URL,
    statsToReceive,
  });

  const batterStats: AllBatterStat[] = useMemo(() => {
    return playerData.total_batting_stats || [];
  }, [playerData.total_batting_stats]);

  const pitcherStats: AllPitcherStat[] = useMemo(() => {
    return playerData.total_pitching_stats || [];
  }, [playerData.total_pitching_stats]);

  const batterHelper = createColumnHelper<AllBatterStat>();

  const batterColumns = useMemo(
    () => [
      batterHelper.accessor("jersey_number", {
        header: "#",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("player_name", {
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
      batterHelper.accessor("games", {
        header: "G",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_pa", {
        header: "PA",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_ab", {
        header: "AB",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_runs", {
        header: "R",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_hits", {
        header: "H",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_rbi", {
        header: "RBI",
        cell: (info) => info.getValue(),
      }),

      batterHelper.accessor("avg", {
        header: "AVG",
        cell: (info) => dot_and_three_decimals(info.getValue()),
      }),
      batterHelper.accessor("total_double", {
        header: "2B",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_triple", {
        header: "3B",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_hr", {
        header: "HR",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_bb", {
        header: "BB",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_strikeouts", {
        header: "SO",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_sb", {
        header: "SB",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_cs", {
        header: "CS",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_hbp", {
        header: "HBP",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_dp", {
        header: "DP",
        cell: (info) => info.getValue(),
      }),
    ],
    [batterHelper]
  );

  const batterTable = useReactTable<AllBatterStat>({
    columns: batterColumns,
    data: batterStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Enable selection only for players with PA > 0
    initialState: {
      sorting: [
        {
          id: "total_pa",
          desc: true, // Sort by AVG in descending order
        },
      ],
    },
  });

  const pitcherHelper = createColumnHelper<AllPitcherStat>();

  const pitcherColumns = useMemo(
    () => [
      pitcherHelper.accessor("jersey_number", {
        header: "#",
        footer: "Total: " + 50,
        cell: (info) => info.getValue(),
        sortDescFirst: true,
      }),
      pitcherHelper.accessor("player_name", {
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
          // {info.getValue()}
        },
      }),
      pitcherHelper.accessor("total_ip", {
        header: "IP",
        cell: (info) => info.getValue().toFixed(1),
        filterFn: greaterThanOrEqualTo,
      }),
      pitcherHelper.accessor("total_wins", {
        header: "W",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_losses", {
        header: "L",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_games", {
        header: "G",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_starts", {
        header: "GS",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_era", {
        header: "ERA",
        cell: (info) =>
          info.getValue() != null ? info.getValue().toFixed(2) : "--",
        sortDescFirst: true,
      }),
      pitcherHelper.accessor("total_h", {
        header: "H",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_r", {
        header: "R",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_er", {
        header: "ER",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_bb", {
        header: "BB",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_so", {
        header: "SO",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_bf", {
        header: "BF",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_hr_allowed", {
        header: "HR",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_saves", {
        header: "SV",
        cell: (info) => info.getValue(),
      }),
    ],
    [pitcherHelper]
  );

  const pitcherTable = useReactTable<AllPitcherStat>({
    columns: pitcherColumns,
    data: pitcherStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      greaterThanOrEqualTo,
    },
    initialState: {
      sorting: [
        {
          id: "total_ip",
          desc: true,
        },
      ],
    },
  });

  const advancedBatterColumns = useMemo(
    () => [
      batterHelper.accessor("jersey_number", {
        header: "#",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("player_name", {
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
      batterHelper.accessor("games", {
        header: "G",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_pa", {
        header: "PA",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("avg", {
        header: "AVG",
        cell: (info) => dot_and_three_decimals(info.getValue()),
      }),
      batterHelper.accessor("ops", {
        header: "OPS",
        cell: (info) => dot_and_three_decimals(info.getValue()),
      }),
      batterHelper.accessor("obp", {
        header: "OBP",
        cell: (info) => dot_and_three_decimals(info.getValue()),
      }),
      batterHelper.accessor("slg", {
        header: "SLG",
        cell: (info) => dot_and_three_decimals(info.getValue()),
      }),
      {
        header: "HR%",
        id: "hr_pct",
        accessorFn: (row: any) => row.total_hr / row.total_ab,
        cell: (info: any) => {
          const hr = info.row.original.total_hr;
          const ab = info.row.original.total_ab;
          return ab > 0 ? ((hr / ab) * 100).toFixed(2) + "%" : "--";
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
            ? (totalDoubles + 2 * totalTriples + 3 * totalHomeRuns) /
                totalAtBats
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
      {
        header: "AB/HR",
        id: "ab_per_hr",
        accessorFn: (row: any) => {
          const totalAtBats = row.total_ab;
          const totalHomeRuns = row.total_hr;
          return totalHomeRuns > 0 ? totalAtBats / totalHomeRuns : null;
        },
        cell: (info: any) => {
          const abPerHr = info.getValue();
          return abPerHr != null ? abPerHr.toFixed(1) : "--";
        },
        // sortDescFirst: true,
        sortingFn: (rowA: any, rowB: any) => {
          const abPerHrA = rowA.getValue("ab_per_hr");
          const abPerHrB = rowB.getValue("ab_per_hr");

          if (abPerHrA === null || abPerHrA === undefined) return -1; // Treat null/undefined as greater
          if (abPerHrB === null || abPerHrB === undefined) return 1; // Treat null/undefined as greater

          return abPerHrB - abPerHrA; // Ascending order
        },
      },
    ],
    [batterHelper]
  );

  const advancedBatterTable = useReactTable<AllBatterStat>({
    columns: advancedBatterColumns,
    data: batterStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "total_pa",
          desc: true, // Sort by OPS in descending order
        },
      ],
    },
  });

  const pitcherAdvancedColumns = useMemo(
    () => [
      pitcherHelper.accessor("jersey_number", {
        header: "#",
        cell: (info) => {
          return info.getValue();
        },
      }),
      pitcherHelper.accessor("player_name", {
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
      pitcherHelper.accessor("total_ip", {
        header: "IP",
        cell: (info) =>
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(1)
            : "--",
        filterFn: greaterThanOrEqualTo,
      }),
      pitcherHelper.accessor("total_h", {
        header: "H",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_r", {
        header: "R",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_er", {
        header: "ER",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_bb", {
        header: "BB",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_so", {
        header: "SO",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_bf", {
        header: "BF",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_hr_allowed", {
        header: "HR",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_games", {
        header: "G",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_starts", {
        header: "GS",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_era", {
        header: "ERA",
        cell: (info) =>
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(2)
            : "--",
        sortDescFirst: false,
      }),
      pitcherHelper.accessor("total_whip", {
        header: "WHIP",
        cell: (info) =>
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(3)
            : "--",
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
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(1)
            : "--",
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
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(1)
            : "--",
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
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(1)
            : "--",
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
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(1)
            : "--",
        sortDescFirst: false,
      },
      {
        header: "K/BB",
        id: "k_bb",
        accessorFn: (row: any) => {
          return row.total_bb > 0 ? row.total_so / row.total_bb : null;
        },
        cell: (info: any) =>
          typeof info.getValue() === "number"
            ? info.getValue().toFixed(1)
            : "--",
        sortDescFirst: true,
      },
    ],
    [pitcherHelper]
  );

  const pitcherAdvancedTable = useReactTable<AllPitcherStat>({
    columns: pitcherAdvancedColumns,
    data: pitcherStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        total_h: false,
        total_r: false,
        total_er: false,
        total_bb: false,
        total_so: false,
        total_bf: false,
        total_hr_allowed: false,
      },
      sorting: [
        {
          id: "total_ip",
          desc: true, // Sort by OPS in descending order
        },
      ],
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full min-h-screen px-4 py-6">
      <ToggleTabs
        options={[
          "Batting",
          "Advanced Batting",
          "Pitching",
          "Advanced Pitching",
          "Fielding",
        ]}
        toggle={toggle}
        setToggle={setToggle}
      />
      <div className={toggle === 0 ? "block" : "hidden"}>
        {/* My goal is to pass a parameter which will set a highlight condition... I tried modifying the text after the . but that didn't
        work ... I also tried passing the entire brackets, which also didn't work. I want the highlighting to look the same, so I don't need to modify
        the styling. Just the condition... how to pass a boolean condition through parameters */}

        <DisplayTable
          table={batterTable}
          isRowHighlighted={(row: any) => {
            return row.getValue("total_pa") >= 151;
          }}
          customHeaders={batterSeasonTotalHeader}
        />
      </div>
      <div className={toggle === 1 ? "block" : "hidden"}>
        <DisplayTable
          table={advancedBatterTable}
          isRowHighlighted={(row: any) => row.getValue("total_pa") >= 151}
          customHeaders={batterSeasonTotalHeader}
        />
      </div>
      <div className={toggle === 2 ? "block" : "hidden"}>
        <DisplayTable
          table={pitcherTable}
          isRowHighlighted={(row: any) => row.getValue("total_ip") >= 50}
          customHeaders={pitcherSeasonTotalHeader}
        />
      </div>
      <div className={toggle === 3 ? "block" : "hidden"}>
        <DisplayTable
          table={pitcherAdvancedTable}
          isRowHighlighted={(row: any) => row.getValue("total_ip") >= 50}
          customHeaders={pitcherSeasonTotalHeader}
        />
      </div>
    </div>
  );
};
export default AllPlayerStats;
