import { variables } from "./Variables.tsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface AllBatterStat {
  id: number;
  player_id: number;
  total_hits: number;
  player_name: string;
  jersey_number: string;
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
}

// this can be the Batter specific main page
const AllPlayerStats = () => {
  const [batterStats, setBatterStats] = useState<AllBatterStat[]>([]);
  const [loading, setLoading] = useState(true);

  const three_decimals = (value: number) => {
    const rounded = value.toFixed(3);
    return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
  };

  useEffect(() => {
    const fetchAllPlayerStats = async () => {
      try {
        const response = await fetch(
          `${variables.API_BASE_URL}all_batter_stats`
        );
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();
        console.log("Batter stats data:", data);
        setBatterStats(data);
      } catch (error) {
        console.error("Error fetching all players batting stats: " + error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPlayerStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Batters</h1>

      <ul>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse bg-gray-50 text-black w-full">
            <thead className="bg-gray-300 text-orange-600">
              <tr>
                <th className="px-2 border border-gray-400">#</th>
                <th className="px-6 border border-gray-400">Player Name</th>
                <th className="px-2 border border-gray-400">G</th>
                <th className="px-2 border border-gray-400">PA</th>
                <th className="px-2 border border-gray-400">AB</th>
                <th className="px-2 border border-gray-400">R</th>
                <th className="px-2 border border-gray-400">H</th>
                <th className="px-2 border border-gray-400">2B</th>
                <th className="px-2 border border-gray-400">3B</th>
                <th className="px-2 border border-gray-400">HR</th>
                <th className="px-2 border border-gray-400">RBI</th>
                <th className="px-2 border border-gray-400">SB</th>
                <th className="px-2 border border-gray-400">CS</th>
                <th className="px-2 border border-gray-400">BB</th>
                <th className="px-2 border border-gray-400">SO</th>
                <th className="px-4 border border-gray-400">BA</th>
                <th className="px-4 border border-gray-400">OBP</th>
                <th className="px-4 border border-gray-400">SLG</th>
                <th className="px-4 border border-gray-400">OPS</th>
                <th className="px-2 border border-gray-400">TB</th>
                <th className="px-2 border border-gray-400">DP</th>
                <th className="px-2 border border-gray-400">HBP</th>
                <th className="px-2 border border-gray-400">SH</th>
                <th className="px-2 border border-gray-400">SF</th>
                <th className="px-2 border border-gray-400">IBB</th>
              </tr>
            </thead>
            <tbody>
              {batterStats.map((stat) => (
                <tr key={stat.id} className="border border-gray-200">
                  <td className="px-2 border border-gray-300">
                    {stat.jersey_number}
                  </td>
                  <td className="px-6 border border-gray-300">
                    <Link
                      to={`/player/${stat.player_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {stat.player_name}
                    </Link>
                  </td>
                  <td className="px-2 border border-gray-300">{stat.games}</td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_pa}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_ab}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_runs}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_hits}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_double}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_triple}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_hr}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_rbi}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_sb}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_cs}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_bb}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_strikeouts}
                  </td>
                  <td className="px-3 border border-gray-300">
                    {three_decimals(stat.avg)}
                  </td>
                  <td className="px-3 border border-gray-300">
                    {three_decimals(stat.obp)}
                  </td>
                  <td className="px-3 border border-gray-300">
                    {three_decimals(stat.slg)}
                  </td>
                  <td className="px-3 border border-gray-300">
                    {three_decimals(stat.ops)}
                  </td>
                  <td className="px-2 border border-gray-300">{stat.tb}</td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_dp}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_hbp}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_sh}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_sf}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {stat.total_ibb}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ul>
    </div>
  );
};

export default AllPlayerStats;
