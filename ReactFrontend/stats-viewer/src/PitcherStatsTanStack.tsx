import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { variables } from "./Variables.tsx";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";

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
    <table className="width-full border-collapse m-1">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                colSpan={header.colSpan}
                key={header.id}
                className="bg-white bold text-black px-1 border solid #ddd"
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
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-1 border solid #ddd">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
