import { useState, useMemo } from "react";
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
import usePlayerStats from "../hooks/usePlayerStats.ts";
import type {
  BattingStat,
  PitchingStat,
  FieldingStat,
} from "../types/statTypes.tsx";
import {
  createBatterGameLogColumns,
  createExtBattingColumns,
} from "../columns/batterColumns.tsx";
import {
  createPitcherColumns,
  createPitchingExtColumns,
} from "../columns/pitcherColumns.tsx";
import { createFieldingColumns } from "../columns/fieldingColumns.tsx";

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
      columnVisibility: {},
    },
  });
  return table;
}

export default function PlayerStats() {
  const [toggle, setToggle] = useState(0);

  const { id } = useParams<{ id: string }>();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statsToReceive = useMemo(
    () => [
      `batter_stats?player_id=${id}`,
      `pitcher_stats?player_id=${id}`,
      `fielding_stats?player_id=${id}`,
      `total_batting_stats?player_id=${id}`,
      `total_pitching_stats?player_id=${id}`,
      `total_fielding_stats_by_pos?player_id=${id}`,
    ],
    [id]
  );

  const { playerData, loading, error } = usePlayerStats({
    API_BASE_URL: variables.API_BASE_URL,
    statsToReceive,
  });
  const batterStats = useMemo(
    () => playerData.batter_stats || [],
    [playerData.batter_stats]
  );
  const pitcherStats = useMemo(
    () => playerData.pitcher_stats || [],
    [playerData.pitcher_stats]
  );
  const fieldingStats = useMemo(
    () => playerData.fielding_stats || [],
    [playerData.fielding_stats]
  );
  const allBattingStats = useMemo(
    () => playerData.total_batting_stats || [],
    [playerData.total_batting_stats]
  );

  const allPitchingStats = useMemo(
    () => playerData.total_pitching_stats || [],
    [playerData.total_pitching_stats]
  );

  const allFieldingStatsByPos = useMemo(
    () => playerData.total_fielding_stats || [],
    [playerData.total_fielding_stats]
  );

  const pitcherTable = createTableConfig<PitchingStat>(
    pitcherStats,
    createPitcherColumns
  );

  const fieldingTable = createTableConfig<FieldingStat>(
    fieldingStats,
    createFieldingColumns
  );

  const advancedPitcherTable = useReactTable({
    data: pitcherStats,
    columns: createPitchingExtColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // initialState: {
    //   columnVisibility: {},
    // },
  });

  console.log("Re-render occurred");

  const batterTable = useReactTable<BattingStat>({
    data: batterStats,
    // columns: createBatterGameLogColumns(createColumnHelper()),
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!batterStats && !pitcherStats && !fieldingStats) {
    return <div>Error accessing the stats.</div>;
  }

  if (!batterStats.length && !pitcherStats.length) {
    return <div>No player stats available.</div>;
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
        <div
          className={
            batterStats.length > 0 || pitcherStats.length > 0
              ? "block"
              : "hidden"
          }
        >
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
            onClick={() => {
              setToggle(3);
            }}
          >
            Pitching Game Log
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
            Extended Pitching Game Log
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
            ["qualified", "Qualified"],
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
          <DisplayTable table={advancedPitcherTable} />
        )}
      </div>
      <div className={toggle === 5 ? "block" : "hidden"}>
        {fieldingStats.length > 0 && <DisplayTable table={fieldingTable} />}
      </div>
    </div>
  );
}
