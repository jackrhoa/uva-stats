import { useState, useEffect, useMemo } from "react";
import { variables } from "../Variables.tsx";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { Row, SortingFn, FilterFn } from "@tanstack/react-table";
import ToggleTabs from "./ToggleTabs.tsx";
import DisplayTable from "./DislayTable.tsx";

const greaterThanOrEqualTo: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);
  return typeof cellValue === "number" && cellValue >= parseFloat(value);
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
const NewAllPlayerStats = () => {
  const [batterStats, setBatterStats] = useState<AllBatterStat[]>([]);
  const [pitcherStats, setPitcherStats] = useState<AllPitcherStat[]>([]);
  const [toggle, setToggle] = useState(0);
  const [loading, setLoading] = useState(true);

  const three_decimals = (value: number) => {
    const rounded = value.toFixed(3);
    return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
  };

  useEffect(() => {
    const fetchAllPlayerStats = async () => {
      try {
        const batterResponse = await fetch(
          `${variables.API_BASE_URL}all_batter_stats`
        );
        const pitcherResponse = await fetch(
          `${variables.API_BASE_URL}all_pitcher_stats`
        );
        if (!batterResponse.ok) {
          throw new Error(
            "HTTP error with batter data: " + batterResponse.status
          );
        }
        if (!pitcherResponse.ok) {
          throw new Error(
            "HTTP error with pitcher data: " + pitcherResponse.status
          );
        }
        const pitcherData = await pitcherResponse.json();
        const batterData = await batterResponse.json();

        setBatterStats(batterData);
        setPitcherStats(pitcherData);
      } catch (error) {
        console.error("Error fetching players' stats: " + error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPlayerStats();
  }, []);

  // This should be used on the main page, not here
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

  const batterHelper = createColumnHelper<AllBatterStat>();

  const batterColumns = useMemo(
    () => [
      batterHelper.accessor("jersey_number", {
        header: "#",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("player_name", {
        header: "Player",
        cell: (info) => info.getValue(),
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
        cell: (info) => three_decimals(info.getValue()),
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
        cell: (info) => info.getValue(),
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
      pitcherHelper.accessor("total_starts", {
        header: "GS",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_games", {
        header: "G",
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

  if (loading) {
    return <div>Loading...</div>;
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
          highlight_condition={"total_pa"}
          highlight_gte_value={151}
        />
      </div>
      <div className={toggle === 2 ? "block" : "hidden"}>
        <DisplayTable
          table={pitcherTable}
          highlight_condition={"total_ip"}
          highlight_gte_value={50}
          enableFilters={true}
        />
      </div>
    </div>
  );
};
export default NewAllPlayerStats;
