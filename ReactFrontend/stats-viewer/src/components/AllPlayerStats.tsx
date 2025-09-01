import { useState, useMemo, useEffect } from "react";
import { variables } from "../Variables.tsx";
import usePlayerStats from "../hooks/usePlayerStats.ts";
import { Error } from "./Error.tsx";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
  type ColumnFiltersState,
  type Row,
} from "@tanstack/react-table";
import ToggleTabs from "./ToggleTabs.tsx";
import DisplayTable from "./DisplayTable.tsx";
import type {
  AllBattingStat,
  AllFieldingStatByPlayer,
  AllPitchingStat,
} from "../types/statTypes.tsx";
import { greaterThanOrEqualTo } from "../helpers/filterFns.ts";
import {
  batterSeasonTotalHeader,
  pitcherSeasonTotalHeader,
  min_plate_appearance,
} from "../helpers/miscHelpers.tsx";
import {
  createTotalBattingColumns,
  createTotalBattingAdvColumns,
} from "../columns/batterColumns.tsx";
import {
  createTotalPitchingColumns,
  createTotalPitchingAdvColumns,
} from "../columns/pitcherColumns.tsx";
import { createTotalFieldingByPlayerColumns } from "../columns/fieldingColumns.tsx";
import FilterGUI from "./FilterGUI.tsx";
import { loadState } from "../helpers/saveState.ts";
// this can be the Batter specific main page
const AllPlayerStats = () => {
  const [toggle, setToggle] = useState(0);
  const [batterColumnFilters, setBatterColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [pitchingColumnFilters, setPitchingColumnFilters] =
    useState<ColumnFiltersState>([]);

  useEffect(() => {
    const savedToggle = loadState("mainToggle");
    if (savedToggle !== undefined) {
      setToggle(savedToggle);
    }
  }, []);
  // stats to receive should contain trailing slash to prevent automatic redirects
  const statsToReceive = useMemo(
    () => [
      "total_batting_stats/",
      "total_pitching_stats/",
      "total_fielding_stats_by_player/",
    ],
    []
  );

  const { playerData, loading, error } = usePlayerStats({
    API_BASE_URL: variables.API_BASE_URL,
    statsToReceive,
  });

  const totalBattingStats: AllBattingStat[] = useMemo(() => {
    return playerData.total_batting_stats || [];
  }, [playerData.total_batting_stats]);

  const totalPitchingStats: AllPitchingStat[] = useMemo(() => {
    return playerData.total_pitching_stats || [];
  }, [playerData.total_pitching_stats]);

  const totalFieldingStatsByPlayer: AllFieldingStatByPlayer[] = useMemo(() => {
    return playerData.total_fielding_stats_by_player || [];
  }, [playerData.total_fielding_stats_by_player]);

  const totalBattingTable = useReactTable<AllBattingStat>({
    columns: createTotalBattingColumns(createColumnHelper()),
    data: totalBattingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        total_team_games: false,
        qualified: false,
      },
      sorting: [
        {
          id: "total_pa",
          desc: true,
        },
      ],
    },
    state: {
      columnFilters: batterColumnFilters,
    },
  });

  const totalBatterAdvTable = useReactTable<AllBattingStat>({
    columns: createTotalBattingAdvColumns(createColumnHelper()),
    data: totalBattingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        total_team_games: false,
        total_ab: false,
        total_runs: false,
        total_hits: false,
        total_double: false,
        total_triple: false,
        total_hr: false,
        total_rbi: false,
        total_bb: false,
        total_strikeouts: false,
        total_sb: false,
        total_cs: false,
        total_hbp: false,
        total_sh: false,
        total_sf: false,
        total_ibb: false,
        qualified: false,
        games: false,
      },
      sorting: [
        {
          id: "total_pa",
          desc: true,
        },
      ],
    },
    state: {
      columnFilters: batterColumnFilters,
    },
  });

  const totalPitchingTable = useReactTable<AllPitchingStat>({
    columns: createTotalPitchingColumns(createColumnHelper()),
    data: totalPitchingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      greaterThanOrEqualTo,
    },
    initialState: {
      columnVisibility: {
        total_team_games: false,
        qualified: false,
        total_outs: false,
      },
      sorting: [
        {
          id: "total_ip",
          desc: true,
        },
        { id: "total_era", desc: false },
      ],
    },
    state: {
      columnFilters: pitchingColumnFilters,
    },
  });

  const totalPitchingAdvTable = useReactTable<AllPitchingStat>({
    columns: createTotalPitchingAdvColumns(createColumnHelper()),
    data: totalPitchingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        total_h: false,
        total_r: false,
        total_er: false,
        total_bb: false,
        total_so: false,
        total_bf: false,
        total_hr_allowed: false,
        total_team_games: false,
        qualified: false,
        total_outs: false,
      },
      sorting: [
        { id: "total_ip", desc: true },
        { id: "total_era", desc: false },
      ],
    },
    state: {
      columnFilters: pitchingColumnFilters,
    },
  });

  const totalFieldingByPlayerTable = useReactTable<AllFieldingStatByPlayer>({
    columns: createTotalFieldingByPlayerColumns(createColumnHelper()),
    data: totalFieldingStatsByPlayer,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        total_team_games: false,
        total_pa: false,
      },
      sorting: [{ id: "total_player_games", desc: true }],
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="w-full min-h-screen px-3">
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
      <div className="flex w-full gap-2 border-red-500 border6-2 rounded-lg p-1">
        <div className="w-64p-4">
          {(toggle === 1 || toggle === 0) && (
            <FilterGUI
              options={[
                ["qualified", "Qualified"],
                ["total_hits", "Hits"],
                ["total_hr", "HR"],
                ["total_rbi", "RBI"],
                ["total_bb", "BB"],
                ["total_strikeouts", "SO"],
                ["total_double", "2B"],
              ]}
              columnFilters={batterColumnFilters}
              setColumnFilters={setBatterColumnFilters}
            />
          )}
          {(toggle === 2 || toggle === 3) && (
            <FilterGUI
              options={[
                ["qualified", "Qualified"],
                // ["total_ip", "Innings Pitched"],
                // ["total_starts", "Starts"],
                // ["total_h", "Hits Allowed"],
                // ["total_r", "Runs Allowed"],
                // ["total_er", "Earned Runs"],
                // ["total_bb", "Walks Allowed"],
                // ["total_so", "Strikeouts"],
                // ["total_bf", "Batters Faced"],
                // ["total_hr_allowed", "Home Runs Allowed"],
                // ["total_hr", "Home Runs"],
                // ["total_hits", "Hits"],
                // ["total_hr", "HR"],
                // ["total_rbi", "RBI"],
                // ["total_bb", "BB"],
                // ["total_strikeouts", "SO"],
                // ["total_double", "2B"],
              ]}
              columnFilters={pitchingColumnFilters}
              setColumnFilters={setPitchingColumnFilters}
            />
          )}
        </div>
        <div className="flex-1 p-2">
          <div className={toggle === 0 ? "block" : "hidden"}>
            <DisplayTable
              table={totalBattingTable}
              isRowHighlighted={(row: Row<AllBattingStat>) => {
                return Boolean(row.getValue("qualified"));
              }}
              customHeaders={batterSeasonTotalHeader}
            />
          </div>
          <div className={toggle === 1 ? "block" : "hidden"}>
            <DisplayTable
              table={totalBatterAdvTable}
              isRowHighlighted={(row: Row<AllBattingStat>) => {
                return Boolean(row.getValue("qualified"));
              }}
              customHeaders={batterSeasonTotalHeader}
            />
          </div>
          <div className={toggle === 2 ? "block" : "hidden"}>
            <DisplayTable
              table={totalPitchingTable}
              isRowHighlighted={(row: Row<AllPitchingStat>) =>
                Boolean(row.getValue("qualified"))
              }
              customHeaders={pitcherSeasonTotalHeader}
            />
          </div>
          <div className={toggle === 3 ? "block" : "hidden"}>
            <DisplayTable
              table={totalPitchingAdvTable}
              isRowHighlighted={(row: Row<AllPitchingStat>) =>
                Boolean(row.getValue("qualified"))
              }
              customHeaders={pitcherSeasonTotalHeader}
            />
          </div>
          <div className={toggle === 4 ? "block" : "hidden"}>
            <DisplayTable
              table={totalFieldingByPlayerTable}
              isRowHighlighted={(row: Row<AllFieldingStatByPlayer>) =>
                Number(row.getValue("total_pa")) / min_plate_appearance >=
                Number(row.getValue("total_team_games"))
              }
              customHeaders={batterSeasonTotalHeader}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AllPlayerStats;
