import { useState, useEffect, useMemo } from "react";
import { variables } from "../Variables.tsx";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import type { Row, SortingFn } from "@tanstack/react-table";

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

        const sortedPitcherData = pitcherData.sort(
          (a: AllPitcherStat, b: AllPitcherStat) => {
            const eraA = a.total_era ?? Infinity; // Treat null/undefined as Infinity
            const eraB = b.total_era ?? Infinity; // Treat null/undefined as Infinity
            const ipA = a.total_ip ?? 0; // Treat null/undefined as 0
            const ipB = b.total_ip ?? 0; // Treat null/undefined as 0
            const teamGames = 50; // Assuming 50 games for qualification
            const isQualifiedA = ipA >= teamGames;
            const isQualifiedB = ipB >= teamGames;
            if (isQualifiedA && isQualifiedB) {
              return eraA - eraB; // Both qualified, sort by ERA
            } else if (isQualifiedA) {
              return -1; // A is qualified, B is not
            } else if (isQualifiedB) {
              return 1; // B is qualified, A is not
            }
            return eraA - eraB; // Neither qualified, sort by ERA
          }
        );

        setBatterStats(batterData);
        setPitcherStats(sortedPitcherData);
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
      batterHelper.accessor("total_rbi", {
        header: "RBI",
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
      batterHelper.accessor("total_ibb", {
        header: "IBB",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_dp", {
        header: "DP",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_sh", {
        header: "SH",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_sf", {
        header: "SF",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("total_picked_off", {
        header: "PO",
        cell: (info) => info.getValue(),
      }),
      batterHelper.accessor("avg", {
        header: "AVG",
        cell: (info) => three_decimals(info.getValue()),
      }),
    ],
    [batterHelper]
  );

  const pitcherHelper = createColumnHelper<AllPitcherStat>();
  const pitcherColumns = useMemo(
    () => [
      pitcherHelper.accessor("jersey_number", {
        header: "#",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("player_name", {
        header: "Player",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_ip", {
        header: "IP",
        cell: (info) => info.getValue(),
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
      pitcherHelper.accessor("total_doubles_allowed", {
        header: "2B",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_triples_allowed", {
        header: "3B",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_hr_allowed", {
        header: "HR",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_wp", {
        header: "WP",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_hb", {
        header: "HB",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_starts", {
        header: "GS",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_ibb", {
        header: "IBB",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_balk", {
        header: "Balk",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_ir", {
        header: "IR",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_irs", {
        header: "IRS",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_sh_allowed", {
        header: "SH",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_sf_allowed", {
        header: "SF",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_saves", {
        header: "SV",
        cell: (info) => info.getValue(),
      }),
      pitcherHelper.accessor("total_era", {
        header: "ERA",
        cell: (info) => three_decimals(info.getValue()),
      }),
      pitcherHelper.accessor("total_whip", {
        header: "WHIP",
        cell: (info) => three_decimals(info.getValue()),
      }),
    ],
    [pitcherHelper]
  );

  const batterTable = useReactTable<AllBatterStat>({
    columns: batterColumns,
    data: batterStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "games",
          desc: true, // Sort by AVG in descending order
        },
      ],
    },
  });

  const pitcherTable = useReactTable<AllPitcherStat>({
    columns: pitcherColumns,
    data: pitcherStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen px-4 py-6">
      <div
        className="w-full h-[90vh] overflow-x-auto shadow-lg rounded-lg border border-gray-300 mb-5"
        style={
          {
            "--header-bg": "#1f2937", // bg-gray-800 equivalent
            "--header-border": "#4b5563", // border-gray-600 equivalent
          } as React.CSSProperties
        }
      >
        <table
          className="w-full h-full border-separate border-spacing-0 bg-white text-sm table-auto"
          style={{ borderCollapse: "separate" }}
        >
          <thead className="sticky top-0 z-10 bg-gray-800">
            {batterTable.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-800 text-white"
                style={{ background: "var(--header-bg)" }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    colSpan={header.colSpan}
                    key={header.id}
                    className="px-3 py-3 text-center font-bold bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors uppercase tracking-wide text-xs relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-px before:bg-gray-600"
                    style={{
                      boxShadow:
                        "inset 1px 0 0 rgba(0,0,0,0), inset 0 1px 0 rgba(0,0,0,0), inset -1px 0 0 rgba(75,85,99,1)",
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <span
                        className={`text-sm font-bold ${
                          header.column.getIsSorted()
                            ? "opacity-90"
                            : "opacity-60"
                        }`}
                      >
                        {
                          {
                            asc: "▲",
                            desc: "▼",
                            false: header.column.getCanSort() ? "⇕" : "",
                          }[(header.column.getIsSorted() as string) ?? false]
                        }
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="h-full">
            {batterTable.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition-colors`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-center border border-gray-200 font-mono text-gray-800"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="w-full h-[90vh] overflow-x-auto shadow-lg rounded-lg border border-gray-300"
        style={
          {
            "--header-bg": "#1f2937", // bg-gray-800 equivalent
            "--header-border": "#4b5563", // border-gray-600 equivalent
          } as React.CSSProperties
        }
      >
        {/* Begin pitcher table */}

        <table
          className="w-full h-full border-separate border-spacing-0 bg-white text-sm table-auto"
          style={{ borderCollapse: "separate" }}
        >
          <thead className="sticky top-0 z-10 bg-gray-800">
            {pitcherTable.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-800 text-white"
                style={{ background: "var(--header-bg)" }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    colSpan={header.colSpan}
                    key={header.id}
                    className="px-3 py-3 text-center font-bold bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors uppercase tracking-wide text-xs relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-px before:bg-gray-600"
                    style={{
                      boxShadow:
                        "inset 1px 0 0 rgba(0,0,0,0), inset 0 1px 0 rgba(0,0,0,0), inset -1px 0 0 rgba(75,85,99,1)",
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <span
                        className={`text-sm font-bold ${
                          header.column.getIsSorted()
                            ? "opacity-90"
                            : "opacity-60"
                        }`}
                      >
                        {
                          {
                            asc: "▲",
                            desc: "▼",
                            false: header.column.getCanSort() ? "⇕" : "",
                          }[(header.column.getIsSorted() as string) ?? false]
                        }
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="h-full">
            {pitcherTable.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition-colors`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-center border border-gray-200 font-mono text-gray-800"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default NewAllPlayerStats;
