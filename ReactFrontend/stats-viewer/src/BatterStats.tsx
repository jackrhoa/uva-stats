import { variables } from "./Variables.tsx";
import React, { useEffect, useState } from "react";

interface BatterStatsProps {
  player_id: number;
}

interface BatterStat {
  id: number;
  player_id: number;
  player_name?: string;
  game_id: number;
  ab: number;
  pa: number;
  runs: number;
  hits: number;
  rbi: number;
  bb: number;
  so: number;
  hbp: number;
  ibb: number;
  sb: number;
  cs: number;
  dp: number;
  double: number;
  triple: number;
  hr: number;
  sf: number;
  sh: number;
  picked_off: number;
}

// this can be the Batter specific main page
const BatterStats: React.FC<BatterStatsProps> = ({ player_id }) => {
  const [batterStats, setBatterStats] = useState<BatterStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatterStats = async () => {
      try {
        const response = await fetch(
          `${variables.API_BASE_URL}batter_stats/?player_id=${player_id}`
        );
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();
        console.log("Batter stats data:", data);
        setBatterStats(data);
      } catch (error) {
        console.error(
          "Error fetching batter stats for " + player_id + ": " + error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBatterStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Batter Stats</h2>

      <ul>
        <div>
          <table className="bg-red-700 text-white border">
            <thead>
              <tr>
                <th className="px-4">Game Date</th>
                <th className="px-3">AB</th>
                <th className="px-3">R</th>
                <th className="px-3">RBI</th>
                <th className="px-3">H</th>
              </tr>
            </thead>
            <tbody>
              {batterStats.map((stat) => (
                <tr key={stat.id}>
                  <td>{stat.game_id}</td>
                  <td>{stat.ab}</td>
                  <td>{stat.runs}</td>
                  <td>{stat.rbi}</td>
                  <td>{stat.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ul>
    </div>
  );
};

export default BatterStats;
