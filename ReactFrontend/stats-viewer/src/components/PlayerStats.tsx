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
import type { ColumnHelper, ColumnFiltersState } from "@tanstack/react-table";

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

const createBatterColumns = (helper: ColumnHelper<BatterStat>) => [
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
  helper.accessor("avg", {
    header: "BA",
    cell: (info: any) => {
      const value = info.getValue();
      return value > 0 ? dot_and_three_decimals(value) : "--";
    },
  }),
  helper.accessor("obp", {
    header: "OBP",
    cell: (info: any) => {
      const value = info.getValue();
      return value > 0 ? dot_and_three_decimals(value) : "--";
    },
  }),
  helper.accessor("slg", {
    header: "SLG",
    cell: (info: any) => {
      const value = info.getValue();
      return value > 0 ? dot_and_three_decimals(value) : "--";
    },
  }),
  {
    header: "OPS",
    id: "ops",
    cell: (info: any) => {
      const obp = info.row.original.obp;
      const slg = info.row.original.slg;
      const ops = obp + slg;
      return ops > 0 ? dot_and_three_decimals(ops) : "--";
    },
  },
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
    cell: (info: any) => {
      const po = info.row.original.po;
      const a = info.row.original.a;
      const e = info.row.original.e;
      return po + a + e;
    },
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

const createAdvancedBattingColumns = (helper: ColumnHelper<BatterStat>) => [
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
    filterFn: "includesString",
    sortDescFirst: true,
  }),
  helper.accessor("pa", {
    header: "PA",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("ab", {
    header: "AB",
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
  helper.accessor("tb", {
    header: "TB",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hits", {
    header: "H",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("sf", {
    header: "SF",
    cell: (info: any) => info.getValue(),
  }),
  helper.accessor("hrpct", {
    header: "HR%",
    cell: (info: any) => info.getValue().toFixed(2) + "%",
  }),
  helper.accessor("bbpct", {
    header: "BB%",
    cell: (info: any) => info.getValue().toFixed(2) + "%",
  }),
  helper.accessor("kpct", {
    header: "K%",
    cell: (info: any) => info.getValue().toFixed(2) + "%",
  }),
  {
    header: "ISO",
    id: "iso",
    cell: (info: any) => {
      const slg = info.row.original.slg;
      const avg = info.row.original.avg;
      const iso = slg - avg;
      return iso > 0 ? dot_and_three_decimals(iso) : "--";
    },
  },
  helper.accessor("babip", {
    header: "BABIP",
    cell: (info: any) => {
      const value = info.getValue();
      return value > 0 ? dot_and_three_decimals(value) : "--";
    },
  }),
  helper.accessor("ab_per_hr", {
    header: "AB/HR",
    cell: (info: any) =>
      info.getValue() != null ? info.getValue().toFixed(1) : "--",
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
        ];

        const [p, b, f] = await Promise.all(
          urls.map((url) =>
            fetch(`${variables.API_BASE_URL}${url}`).then((r) => r.json())
          )
        );
        setBatterStats(p);
        setPitcherStats(b);
        setFieldingStats(f);
        console.log("Pitcher stats data:", p);
        console.log("Batter stats data:", b);
        console.log("Fielding stats data:", f);
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
    columns: createBatterColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // initialState: {
    //   columnVisibility: {
    //     hr: false,
    //     bb: false,
    //     so: false,
    //     ab: false,
    //     tb: false,
    //     hits: false,
    //     pa: false,
    //     sf: false,
    //   },

    //   // columnFilters: [
    //   //   {
    //   //     id: "game_date",
    //   //     value: "2025-04",
    //   //   },
    //   // ],
    // },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  const advancedBatterTable = useReactTable({
    data: batterStats,
    columns: createAdvancedBattingColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        hr: false,
        bb: false,
        so: false,
        ab: false,
        tb: false,
        hits: false,
        pa: false,
        sf: false,
      },

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
            Batting
          </li>
        </div>
        <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 1
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(1)}
          >
            Advanced Batting
          </li>
        </div>
        <div className={pitcherStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 2
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(2)}
          >
            Pitching
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
            Advanced Pitching
          </li>
        </div>
        <div className={fieldingStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 4
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => setToggle(4)}
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
      <div className={toggle === 0 ? "block" : "hidden"}>
        <DisplayTable table={batterTable} />
      </div>
      <div className={toggle === 1 ? "block" : "hidden"}>
        {batterStats.length > 0 && <DisplayTable table={advancedBatterTable} />}
      </div>
      <div className={toggle === 2 ? "block" : "hidden"}>
        {pitcherStats.length > 0 && <DisplayTable table={pitcherTable} />}
      </div>
      <div className={toggle === 3 ? "block" : "hidden"}>
        {pitcherStats.length > 0 && (
          <DisplayTable table={advancedPitcherTable} />
        )}
      </div>
      <div className={toggle === 4 ? "block" : "hidden"}>
        {fieldingStats.length > 0 && <DisplayTable table={fieldingTable} />}
      </div>
    </div>
  );
}
