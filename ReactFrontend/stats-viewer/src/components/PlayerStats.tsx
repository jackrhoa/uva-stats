import { useState, useMemo, useEffect } from "react";
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
import type { ColumnFiltersState } from "@tanstack/react-table";
import usePlayerStats from "../hooks/usePlayerStats.ts";
import type {
  BattingStat,
  PitchingStat,
  FieldingStat,
} from "../types/statTypes.tsx";
import {
  createBatterGameLogColumns,
  createExtBattingColumns,
  // createTotalIndivBattingColumns,
} from "../columns/batterColumns.tsx";
import {
  createPitcherColumns,
  createPitchingExtColumns,
} from "../columns/pitcherColumns.tsx";
import { createFieldingColumns } from "../columns/fieldingColumns.tsx";
import { loadState, saveState } from "../helpers/saveState.ts";
// import getSeasonStats, {
//   getGroupedSeasonStats,
// } from "../helpers/aggregateStats.ts";

export default function PlayerStats() {
  const [toggle, setToggle] = useState(0);

  const { id } = useParams<{ id: string }>();

  const [battingColumnFilters, setBattingColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [pitchingColumnFilters, setPitchingColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [fieldingColumnFilters, setFieldingColumnFilters] =
    useState<ColumnFiltersState>([]);

  const statsToReceive = useMemo(
    () => [
      `batter_stats?player_id=${id}`,
      `pitcher_stats?player_id=${id}`,
      `fielding_stats?player_id=${id}`,
      // `total_batting_stats?player_id=${id}`,
      // `total_pitching_stats?player_id=${id}`,
      // `total_fielding_stats_by_pos?player_id=${id}`,
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
  // const allBattingStats = useMemo(
  //   () => playerData.total_batting_stats || [],
  //   [playerData.total_batting_stats]
  // );

  // const allPitchingStats = useMemo(
  //   () => playerData.total_pitching_stats || [],
  //   [playerData.total_pitching_stats]
  // );

  // const allFieldingStatsByPos = useMemo(
  //   () => playerData.total_fielding_stats || [],
  //   [playerData.total_fielding_stats]
  // );

  useEffect(() => {
    const savedToggle = loadState(id + "Toggle");
    if (savedToggle !== null && savedToggle !== undefined) {
      setToggle(parseInt(savedToggle, 10));
    }
    console.log(" toggle state:", toggle);
  }, [id]);

  const pitcherTable = useReactTable<PitchingStat>({
    data: pitcherStats,
    columns: createPitcherColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters: pitchingColumnFilters,
    },
  });

  const fieldingTable = useReactTable<FieldingStat>({
    data: fieldingStats,
    columns: createFieldingColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters: fieldingColumnFilters,
    },
  });

  const advancedPitcherTable = useReactTable<PitchingStat>({
    data: pitcherStats,
    columns: createPitchingExtColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters: pitchingColumnFilters,
    },
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
        pa: false,
        tb: false,
        dp: false,
        hbp: false,
        sh: false,
        sf: false,
        ibb: false,
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
      columnFilters: battingColumnFilters,
    },
    // onColumnFiltersChange: setColumnFilters,
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
      columnFilters: battingColumnFilters,
    },
    // onColumnFiltersChange: setColumnFilters,
  });

  // const playerSeasonRow = getSeasonStats(batterStats);
  // const seasonStatsData = [playerSeasonRow];

  // const groupedByPosition = useMemo(
  //   () => getGroupedSeasonStats(batterStats, (stat) => stat.player_position),
  //   [id, batterStats]
  // );

  // const seasonTotalBattingTable = useReactTable({
  //   data: groupedByPosition,
  //   columns: createTotalIndivBattingColumns(createColumnHelper()),
  //   getCoreRowModel: getCoreRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   initialState: {
  //     columnVisibility: {},

  //     // columnFilters: [
  //     //   {
  //     //     id: "game_date",
  //     //     value: "2025-04",
  //     //   },
  //     // ],
  //   },
  //   state: {
  //     columnFilters: battingColumnFilters,
  //   },
  //   // onColumnFiltersChange: setColumnFilters,
  // });

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
      <h1 className="mt-10 mb-4 text-2xl font-bold text-black">
        {batterStats.length > 0
          ? batterStats[0].player_name
          : pitcherStats.length > 0
          ? pitcherStats[0].player_name
          : fieldingStats.length > 0
          ? fieldingStats[0].player_name
          : "Player Stats"}
      </h1>
      <ul className="flex justify-center items-center space-x-3 mb-6 text-white font-medium">
        <div
          className={
            batterStats.length > 0 || pitcherStats.length > 0
              ? "block"
              : "hidden"
          }
        >
          <li
            className={`border-2 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 0
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(0);
              saveState(id + "Toggle", 0);
            }}
          >
            Season Totals
          </li>
        </div>
        <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-2 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 1
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(1);
              saveState(id + "Toggle", 1);
            }}
          >
            Batting Game Log
          </li>
        </div>

        <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-2 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 2
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(2);
              saveState(id + "Toggle", 2);
            }}
          >
            Extended Batting Game Log
          </li>
        </div>
        <div className={pitcherStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-2 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 3
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(3);
              saveState(id + "Toggle", 3);
            }}
          >
            Pitching Game Log
          </li>
        </div>
        <div className={pitcherStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-2 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 4
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(4);
              saveState(id + "Toggle", 4);
            }}
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
            onClick={() => {
              setToggle(5);
              saveState(batterStats[0].player_id + "Toggle", 5);
            }}
          >
            Fielding
          </li>
        </div>
      </ul>
      <div className="flex w-full gap-2 border-red-500 border-2 rounded-lg p-1">
        <div className="w-64 bg-gray-100 p-4">
          {(toggle === 1 || toggle === 2) && (
            <FilterGUI
              options={[
                ["pa", "PA"],
                ["ab", "AB"],
                ["hits", "H"],
                ["so", "K"],
                ["bb", "BB"],
                ["hr", "HR"],
                ["game_date", "Date"],

                // ["qualified", "Qualified"],
              ]}
              columnFilters={battingColumnFilters}
              setColumnFilters={setBattingColumnFilters}
            />
          )}
          {(toggle === 3 || toggle === 4) && (
            <FilterGUI
              options={[
                ["ip", "Innings Pitched"],
                // ["ab", "AB"],
                // ["hits", "H"],
                ["game_date", "Date"],

                // ["qualified", "Qualified"],
              ]}
              columnFilters={pitchingColumnFilters}
              setColumnFilters={setPitchingColumnFilters}
            />
          )}
          {toggle === 5 && (
            <FilterGUI
              options={[
                // ["ip", "Innings Pitched"],
                // ["ab", "AB"],
                // ["hits", "H"],
                ["game_date", "Date"],

                // ["qualified", "Qualified"],
              ]}
              columnFilters={fieldingColumnFilters}
              setColumnFilters={setFieldingColumnFilters}
            />
          )}
        </div>

        <div className="flex-1 bg-orange-100 p-4">
          {/* <div className={toggle === 0 ? "block" : "hidden"}>
            <DisplayTable table={seasonTotalBattingTable} />
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
      </div>
    </div>
  );
}
