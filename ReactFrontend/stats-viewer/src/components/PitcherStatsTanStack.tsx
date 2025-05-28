import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { variables } from "../Variables.tsx";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { Row, SortingFn } from "@tanstack/react-table";

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

// everything inside the function is re-rendered every time the component is rendered
export default function PitcherStatsTanStack() {
  const [pitcherStats, setPitcherStats] = useState<PitcherStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const player_id = parseInt(id || "-1");

  useEffect(() => {
    const fetchPitchingStats = async () => {
      try {
        const response = await fetch(
          `${variables.API_BASE_URL}pitcher_stats/?player_id=${player_id}`
        );
        if (!response.ok) throw new Error("HTTP error " + response.status);
        const data = await response.json();
        setPitcherStats(data);
      } catch (error) {
        console.error("Error fetching pitching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPitchingStats();
  }, [player_id]);

  // This should be used on the main page, not here
  const byQualifiedEra: SortingFn<PitcherStat> = (
    rowA: Row<PitcherStat>,
    rowB: Row<PitcherStat>
  ) => {
    const eraA: number = rowA.getValue("era");
    const eraB: number = rowB.getValue("era");

    const ipA: number = rowA.getValue("ip");
    const ipB: number = rowB.getValue("ip");

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

    if (team_games / ipA >= 1) {
    }

    return eraA - eraB; // Ascending order
  };

  const columns = useMemo(
    () => [
      {
        header: "DATE",
        accessorKey: "game_date",
      },
      {
        header: "OPPONENT",
        accessorKey: "opponent",
        enableSorting: false,
      },
      {
        header: "RESULT",
        accessorKey: "game_result",
        sortDescFirst: true,
      },
      {
        header: "DEC",
        accessorKey: "decision",
        sortDescFirst: true,
      },
      {
        header: "POS",
        accessorKey: "starter",
        cell: ({ cell }: { cell: any }) => (cell.getValue() > 0 ? "SP" : "RP"),
      },
      {
        header: "IP",
        accessorKey: "ip",
        sortDescFirst: true,
      },
      {
        header: "H",
        accessorKey: "h",
      },
      {
        header: "R",
        accessorKey: "r",
      },
      {
        header: "ER",
        accessorKey: "er",
      },
      {
        header: "HR",
        accessorKey: "hr_allowed",
      },
      {
        header: "BB",
        accessorKey: "bb",
      },
      {
        header: "K",
        id: "K",
        accessorKey: "so",
      },
      {
        header: "BF",
        accessorKey: "bf",
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: pitcherStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen px-4 py-6">
      <div className="w-full h-[90vh] overflow-x-auto shadow-lg rounded-lg border border-gray-300">
        <table className="w-full h-full border-collapse bg-white text-sm table-auto">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-800 text-white">
                {headerGroup.headers.map((header) => (
                  <th
                    colSpan={header.colSpan}
                    key={header.id}
                    className="px-3 py-3 text-center font-bold border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors uppercase tracking-wide text-xs"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="h-full">
            {table.getRowModel().rows.map((row, index) => (
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
}
