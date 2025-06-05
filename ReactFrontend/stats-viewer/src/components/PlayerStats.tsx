import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { variables } from "../Variables.tsx";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
} from "@tanstack/react-table";
import DisplayTable from "./DisplayTable.tsx";
import FilterGUI from "./FilterGUI.tsx";
import type {
  ColumnHelper,
  ColumnFiltersState,
  SortingFn,
} from "@tanstack/react-table";

const dot_and_three_decimals = (value: number) => {
  const rounded = value.toFixed(3);
  return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
};

type PitcherStat = {
  id: number;
  game_date: Date;
  game_result: string;
  opponent: string;
  decision: string;
  box_score_link: number;
  player_id: number;
  player_name: string;
  player_position: string;
  jersey_number: string;
  ip: number;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  bf: number;
  doubles_allowed: number;
  triples_allowed: number;
  hr_allowed: number;
  wp: number;
  hb: number;
  starter: number;
  ibb: number;
  balk: number;
  ir: number;
  irs: number;
  sh_allowed: number;
  sf_allowed: number;
  kl: number;
  pickoffs: number;
  wins: number;
  losses: number;
  saves: number;
  ab: number;
  era: number;
  whip: number;
  games: number;
};

type BatterStat = {
  id: number;
  player_id: number;
  player_name: string;
  game_result: string;
  game_date: string;
  opponent: string;
  game_id: number;
  ab: number;
  pa: number;
  runs: number;
  hits: number;
  rbi: number;
  bb: number;
  so: number;
  hbp: number;
  ibb: number;
  sb: number;
  cs: number;
  dp: number;
  double: number;
  triple: number;
  hr: number;
  sf: number;
  sh: number;
  picked_off: number;
  avg: number;
  obp: number;
  slg: number;
  hrpct: number;
  bbpct: number;
  kpct: number;
  ab_per_hr: number;
  babip: number;
  tb: number;
  box_score_link: number;
};

type FieldingStat = {
  id: number;
  player_name: string;
  player_id: number;
  game_date: Date;
  opponent: string;
  game_result: string;
  game_id: number;
  player_position: string;
  po: number;
  a: number;
  e: number;
  cum_fcpt: number;
  catchers_interference: number;
  passed_balls: number;
  sba: number;
  cs: number;
  dp: number;
  tp: number;
};

const dashStatSortingFn: SortingFn<any> = (rowA, rowB, columnId) => {
  const dashStatA: string = rowA.getValue(columnId);
  const dashStatB: string = rowB.getValue(columnId);

  const regex = RegExp(/^(\d+)-(\d+)/);

  const statA = dashStatA.match(regex);
  const statB = dashStatB.match(regex);

  const statA1 = statA ? parseInt(statA[1], 10) : null;
  const statA2 = statA ? parseInt(statA[2], 10) : null;
  const statB1 = statB ? parseInt(statB[1], 10) : null;
  const statB2 = statB ? parseInt(statB[2], 10) : null;

  if (statA1 === null || statA2 === null) {
    return (
      new Date(rowA.getValue("game_date")).getTime() -
      new Date(rowB.getValue("game_date")).getTime()
    );
  }
  if (statB1 === null || statB2 === null) {
    return (
      new Date(rowA.getValue("game_date")).getTime() -
      new Date(rowB.getValue("game_date")).getTime()
    );
  }

  if (statA2 === 0 && statB2 === 0) {
    return 0;
  }
  if (statA2 === 0) {
    if (statB1 === 0) {
      return 1;
    }
    return -1;
  } // A comes after B
  if (statB2 === 0) {
    if (statA1 === 0) {
      return -1;
    }
    return 1;
  } // B comes after A
  if (statA1 / statA2 === 0 && statB1 / statB2 === 0) {
    return statB2 - statA2; // Sort by more hits
  }
  if (statA1 / statA2 === 1 && statB1 / statB2 === 1) {
    return statA1 - statB1; // Sort by more hits
  }

  return statA1 / statA2 - statB1 / statB2; // Sort by ratio
};

const createBatterGameLogColumns = (helper: ColumnHelper<BatterStat>) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: (row, columnId, filterValue: Array<Date>) => {
      if (!filterValue || filterValue.length !== 2) {
        return true; // No filter applied
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

const createPitcherColumns = (helper: ColumnHelper<PitcherStat>) => [
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

const createFieldingColumns = (helper: ColumnHelper<FieldingStat>) => [
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

const createExtBattingColumns = (helper: ColumnHelper<BatterStat>) => [
  helper.accessor("game_date", {
    header: "DATE",
    cell: (info: any) => info.getValue(),
    filterFn: (row, columnId, filterValue: Array<Date>) => {
      if (!filterValue || filterValue.length !== 2) {
        return true; // No filter applied
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

const createAdvancedPitchingColumns = (helper: ColumnHelper<PitcherStat>) => [
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
];

function createTableConfig<T>(
  data: T[],
  columnsDef: (helper: ColumnHelper<T>) => any
) {
  const columns = useMemo(() => columnsDef(createColumnHelper()), [columnsDef]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        //
      },
    },
  });
  return table;
}

export default function PitcherStatsTanStack() {
  const [pitcherStats, setPitcherStats] = useState<PitcherStat[]>([]);
  const [batterStats, setBatterStats] = useState<BatterStat[]>([]);
  const [fieldingStats, setFieldingStats] = useState<FieldingStat[]>([]);
  const [allBatterStats, setAllBatterStats] = useState<BatterStat[]>([]);
  const [allPitcherStats, setAllPitcherStats] = useState<PitcherStat[]>([]);
  const [allFieldingStats, setAllFieldingStats] = useState<FieldingStat[]>([]);
  const [toggle, setToggle] = useState(0);
  const dot_and_three_decimals = (value: number) => {
    const rounded = value.toFixed(3);
    return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
  };

  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const player_id = parseInt(id || "-1");

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const urls = [
          `batter_stats/?player_id=${player_id}`,
          `pitcher_stats/?player_id=${player_id}`,
          `fielding_stats/?player_id=${player_id}`,
          `all_batter_stats/?player_id=${player_id}`,
          `all_pitcher_stats/?player_id=${player_id}`,
          `all_fielding_stats/?player_id=${player_id}`,
        ];

        const [b, p, f, ba, pa, fa] = await Promise.all(
          urls.map((url) =>
            fetch(`${variables.API_BASE_URL}${url}`).then((r) => r.json())
          )
        );
        setBatterStats(b);
        setPitcherStats(p);
        setFieldingStats(f);
        setAllBatterStats(ba);
        setAllPitcherStats(pa);
        setAllFieldingStats(fa);
        console.log("Pitcher stats data:", p);
        console.log("Batter stats data:", b);
        console.log("Fielding stats data:", f);
        console.log("All Batter stats data:", ba);
        console.log("All Pitcher stats data:", pa);
        console.log("All Fielding stats data:", fa);
      } catch (error) {
        console.error("Error fetching pitching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerStats();
  }, [player_id]);

  useEffect(() => {
    if (batterStats.length > 0) {
      setToggle(0);
      console.log("Batter stats found, setting toggle to 0");
    } else if (pitcherStats.length > 0) {
      console.log("Only pitcher stats found, setting toggle to 2");
      setToggle(2);
    }
  }, [batterStats, pitcherStats, fieldingStats, loading]);

  // const batterTable = createTableConfig<BatterStat>(
  //   batterStats,
  //   createBatterColumns
  // );
  const pitcherTable = createTableConfig<PitcherStat>(
    pitcherStats,
    createPitcherColumns
  );
  const fieldingTable = createTableConfig<FieldingStat>(
    fieldingStats,
    createFieldingColumns
  );

  const advancedPitcherTable = useReactTable({
    data: pitcherStats,
    columns: createAdvancedPitchingColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // initialState: {
    //   columnVisibility: {},
    // },
  });

  console.log("Toggle state:", toggle);

  const batterTable = useReactTable({
    data: batterStats,
    columns: createBatterGameLogColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        //     hr: false,
        //     bb: false,
        //     so: false,
        //     ab: false,
        //     tb: false,
        //     hits: false,
        //     pa: false,
        //     sf: false,
        ab: false,
        hits: false,
        sb: false,
        cs: false,
      },

      //   // columnFilters: [
      //   //   {
      //   //     id: "game_date",
      //   //     value: "2025-04",
      //   //   },
      //   // ],
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  const batterExtTable = useReactTable({
    data: batterStats,
    columns: createExtBattingColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {},

      // columnFilters: [
      //   {
      //     id: "game_date",
      //     value: "2025-04",
      //   },
      // ],
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="m-3 text-2xl font-bold text-black">
        {batterStats.length > 0
          ? batterStats[0].player_name
          : pitcherStats.length > 0
          ? pitcherStats[0].player_name
          : fieldingStats.length > 0
          ? fieldingStats[0].player_name
          : "Player Stats"}
      </h1>
      <ul className="flex justify-center items-center space-x-4 mb-6 text-white font-medium">
        <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 0
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(0);
            }}
          >
            Season Totals
          </li>
        </div>
        <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 1
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(1);
            }}
          >
            Batting Game Log
          </li>
        </div>

        <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 2
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(2)}
          >
            Extended Batting Game Log
          </li>
        </div>
        <div className={pitcherStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 3
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(3)}
          >
            Pitching
          </li>
        </div>
        <div className={pitcherStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 4
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(4)}
          >
            Advanced Pitching
          </li>
        </div>
        <div className={fieldingStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 5
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(5)}
          >
            Fielding
          </li>
        </div>
      </ul>
      <div>
        <FilterGUI
          options={[
            ["pa", "PA"],
            ["ab", "AB"],
            ["game_date", "Date"],
          ]}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </div>
      {/* <div
        className={toggle === 0 && batterStats.length > 0 ? "block" : "hidden"}
      >
        <DisplayTable table={battingSeasonSummary} />
      </div>
      <div
        className={toggle === 0 && pitcherStats.length > 0 ? "block" : "hidden"}
      >
        <DisplayTable table={pitchingSeasonSummary} />
      </div>
      <div
        className={
          toggle === 0 && fieldingStats.length > 0 ? "block" : "hidden"
        }
      >
        <DisplayTable table={fieldingSeasonSummary} />
      </div> */}
      <div className={toggle === 1 ? "block" : "hidden"}>
        <DisplayTable table={batterTable} />
      </div>
      <div className={toggle === 2 ? "block" : "hidden"}>
        {batterStats.length > 0 && <DisplayTable table={batterExtTable} />}
      </div>
      <div className={toggle === 3 ? "block" : "hidden"}>
        {pitcherStats.length > 0 && <DisplayTable table={pitcherTable} />}
      </div>
      <div className={toggle === 4 ? "block" : "hidden"}>
        {pitcherStats.length > 0 && (
          <DisplayTable table={advancedPitcherTable} filterEnabled={false} />
        )}
      </div>
      <div className={toggle === 5 ? "block" : "hidden"}>
        {fieldingStats.length > 0 && <DisplayTable table={fieldingTable} />}
      </div>
    </div>
  );
}
