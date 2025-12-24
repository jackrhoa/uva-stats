import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { variables } from "../Variables.tsx";
import { Error } from "./Error.tsx";
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
  BattingSituationalStat,
  SituationalStat,
} from "../types/statTypes.tsx";
import {
  createBatterGameLogColumns, createBatterSituationalColumns,
  createExtBattingColumns,
  // createBatterSituationalColumns,
  // createTotalIndivBattingColumns,
} from "../columns/batterColumns.tsx";
import {
  createPitcherColumns,
  createPitchingExtColumns,
} from "../columns/pitcherColumns.tsx";
import { createFieldingColumns } from "../columns/fieldingColumns.tsx";
import { loadState, saveState } from "../helpers/saveState.ts";

export default function PlayerStats() {
  const [toggle, setToggle] = useState(1);

  const { id } = useParams<{ id: string }>();

  const [battingColumnFilters, setBattingColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [pitchingColumnFilters, setPitchingColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [fieldingColumnFilters, setFieldingColumnFilters] =
    useState<ColumnFiltersState>([]);
  // question marks must be directly proceeded by flashes to prevent automatic redirects
  const statsToReceive = useMemo(
    () => [
      `batter_stats/?player_id=${id}`,
      `pitcher_stats/?player_id=${id}`,
      `fielding_stats/?player_id=${id}`,
      `batter_situational_stats/?player_id=${id}`,
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
  const batterSituationalStats: BattingSituationalStat[] = useMemo(
      () => playerData.batter_situational_stats || [],
      [playerData.batter_situational_stats]
  );
  const pitcherStats = useMemo(
    () => playerData.pitcher_stats || [],
    [playerData.pitcher_stats]
  );
  const fieldingStats = useMemo(
    () => playerData.fielding_stats || [],
    [playerData.fielding_stats]
  );



  const results = useMemo(
      () => {

        const results: Record<string, number>[] = [{}];

        // each different "situation" should be its own ARRAY

        for (const gamePlayed in batterSituationalStats) {
          console.log("GAME PLAYED: " + gamePlayed);
          const searchByField: Record<string, any> = batterSituationalStats[gamePlayed];
          let iter = 0;
        for (const field in batterSituationalStats[gamePlayed]) {



          if (typeof searchByField[field] === "object") {

            const temp: Record<string, number> = {};
            temp["Situation"] = iter;
            let first_key = 0;
            for (const nested_field in searchByField[field]) {
              if (first_key == 0) {
                  if (temp["games"] === undefined) {
                    temp["games"] = 1;
                  } else
                    temp["games"] += 1;

                first_key++;
              }

              if (typeof searchByField[field][nested_field] === "string") {
                // DO NOTHING because we cannot add strings
              } else {
                temp[nested_field] = searchByField[field][nested_field];
              }
            }
            // put temp directly in results array if values don't exist already
            if (results[iter] === undefined) {
              results[iter] = temp;
            } else {
              // add new values to existing fields if values exist
              for (const key in temp) {
                if (results[iter][key] === undefined) {
                  results[iter][key] = temp[key];
                } else if (typeof results[iter][key] === "string") {
                  results[iter][key] = temp[key];
                } else if (typeof results[iter][key] === "number" && typeof temp[key] === "number")
                {
                  results[iter][key] += temp[key];
                }
              }
            }
            iter++;

          }
        }
      }
        return results
      }
  , [batterSituationalStats]);



  // const flatBatterSituationalStats = useMemo(
  //     () => {
  //       const flat: any = batterSituationalStats.flat();
  //       return flat;
  //     }
  // , [batterSituationalStats]);


  // console.log("H vs RHP: " + HvsRHP);
  // console.log("AB vs RHP: " + ABvsRHP);
  // console.log(results[0]["H"] + "-" + results[0]["AB"] + " vs RHP");
  //
  //
  // console.log("TESTT:: " + batterSituationalStats);

  // const flattenedSituationalStats = useMemo(() => {
  //   return batterSituationalStats.flatMap((stat) => ({
  //     player_name: stat.player_name,
  //     player_id: stat.player_id,
  //     school: stat.school,
  //     with_runners: JSON.stringify(stat.with_runners),
  //     hits_with_risp: {
  //       H: stat.hits_with_risp.H,
  //       AB: stat.hits_with_risp.AB,
  //     },
  //     vs_lhp: JSON.stringify(stat.vs_lhp),
  //     vs_rhp: JSON.stringify(stat.vs_rhp),
  //     leadoff_pct: JSON.stringify(stat.leadoff_pct),
  //     rbi_runner_on_3rd: JSON.stringify(stat.rbi_runner_on_3rd),
  //     h_pinchhit: JSON.stringify(stat.h_pinchhit),
  //     runners_advanced: JSON.stringify(stat.runners_advanced),
  //     with_two_outs: JSON.stringify(stat.with_two_outs),
  //     with_two_runners: JSON.stringify(stat.with_two_runners),
  //   }));
  // }, [batterSituationalStats]);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newToggle = params.get("toggle");
    if (newToggle !== null && newToggle !== undefined) {
      setToggle(parseInt(newToggle, 10));
    }
  }, [location.search]);

  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   const x = params.get("x");
  //   if (x !== null) {
  //     setXValue(x);
  //   }
  // }, [location.search]);

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
        home_away: false,
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
  const batterSituationalTable: any = useReactTable({
    data: results,
    // what i've written the code for is to get individual stats in a list. However, the
    // way this table thing works is that it makes each row
    columns: createBatterSituationalColumns(createColumnHelper()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {},
    },
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
    return <Error message={error} />;
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
          {/* <li
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
          </li> */}
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
        {/* <div className={batterStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-2 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 6
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(6);
              saveState(id + "Toggle", 6);
            }}
          >
            Situational Batting
          </li>
        </div> */}
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
        <div className={batterSituationalStats.length > 0 ? "block" : "hidden"}>
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
            Situational Stats
          </li>
        </div>
        <div className={fieldingStats.length > 0 ? "block" : "hidden"}>
          <li
            className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
              toggle === 6
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }`}
            onClick={() => {
              setToggle(6);
              saveState(batterStats[0].player_id + "Toggle", 6);
            }}
          >
            Fielding
          </li>
        </div>
      </ul>
      <div className="flex w-full gap-2 rounded-lg p-1">
        <div className="w-64 p-4">
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
          {toggle === 6 && (
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

        <div className="flex-1 p-4">
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
            {batterSituationalStats.length > 0 && (
                <DisplayTable table={batterSituationalTable}/>
            )}
          </div>
          <div className={toggle === 6 ? "block" : "hidden"}>
            {fieldingStats.length > 0 && <DisplayTable table={fieldingTable} />}
          </div>
        </div>
      </div>
    </div>
  );
}
