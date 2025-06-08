import { useState, useMemo } from "react";
import { variables } from "../Variables.tsx";
import usePlayerStats from "../hooks/usePlayerStats.ts";
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
  min_innings_pitched,
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
// this can be the Batter specific main page
const AllPlayerStats = () => {
  const [toggle, setToggle] = useState(0);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statsToReceive = useMemo(
    () => [
      "total_batting_stats",
      "total_pitching_stats",
      "total_fielding_stats_by_player",
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
      },
      sorting: [
        {
          id: "total_pa",
          desc: true,
        },
      ],
    },
    state: {
      columnFilters,
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
      },
      sorting: [
        {
          id: "total_ip",
          desc: true,
        },
        { id: "total_era", desc: false },
      ],
    },
  });

  const totalBatterAdvTable = useReactTable<AllBattingStat>({
    columns: createTotalBattingAdvColumns(createColumnHelper()),
    data: totalBattingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        total_team_games: false,
      },
      sorting: [
        {
          id: "total_pa",
          desc: true,
        },
      ],
    },
  });

  const totalPitchingAdvTable = useReactTable<AllPitchingStat>({
    columns: createTotalPitchingAdvColumns(createColumnHelper()),
    data: totalPitchingStats,
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
        total_team_games: false,
      },
      sorting: [
        { id: "total_ip", desc: true },
        { id: "total_era", desc: false },
      ],
    },
  });

  const totalFieldingByPlayerTable = useReactTable<AllFieldingStatByPlayer>({
    columns: createTotalFieldingByPlayerColumns(createColumnHelper()),
    data: totalFieldingStatsByPlayer,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      <div>
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
      </div>
      <div className={toggle === 0 ? "block" : "hidden"}>
        <DisplayTable
          table={totalBattingTable}
          isRowHighlighted={(row: Row<AllBattingStat>) => {
            return (
              Number(row.getValue("total_pa")) / 3.1 >=
              Number(row.getValue("total_team_games"))
            );
          }}
          customHeaders={batterSeasonTotalHeader}
        />
      </div>
      <div className={toggle === 1 ? "block" : "hidden"}>
        <DisplayTable
          table={totalBatterAdvTable}
          isRowHighlighted={(row: Row<AllBattingStat>) => {
            return (
              Number(row.getValue("total_pa")) / min_plate_appearance >=
              Number(row.getValue("total_team_games"))
            );
          }}
          customHeaders={batterSeasonTotalHeader}
        />
      </div>
      <div className={toggle === 2 ? "block" : "hidden"}>
        <DisplayTable
          table={totalPitchingTable}
          isRowHighlighted={(row: Row<AllPitchingStat>) =>
            Number(row.getValue("total_ip")) / min_innings_pitched >=
            Number(row.getValue("total_team_games"))
          }
          customHeaders={pitcherSeasonTotalHeader}
        />
      </div>
      <div className={toggle === 3 ? "block" : "hidden"}>
        <DisplayTable
          table={totalPitchingAdvTable}
          isRowHighlighted={(row: Row<AllPitchingStat>) =>
            Number(row.getValue("total_ip")) / min_innings_pitched >=
            Number(row.getValue("total_team_games"))
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
  );
};
export default AllPlayerStats;
