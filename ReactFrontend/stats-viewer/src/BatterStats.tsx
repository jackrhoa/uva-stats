import { variables } from "./Variables.tsx";
import React, { use, useEffect, useState } from "react";

interface BatterStatsProps {
  playerId: number;
}

const BatterStats: React.FC<BatterStatsProps> = ({ playerId }) => {
  const [batterStats, setBatterStats] = useState<BatterStatsProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //     useEffect(() => {
  //     fetch(`${variables.API_BASE_URL}/batter_stats/?player_id=${playerId}`)
  //         .then(res) => {
  //             if (!res.ok) {
  //                 throw new Error('Failed to fetch batter stats');
  //             }
  //         return res.json();
  //     }

  //   }, [playerId]);

  return <div>BatterStats</div>;
};

export default BatterStats;
