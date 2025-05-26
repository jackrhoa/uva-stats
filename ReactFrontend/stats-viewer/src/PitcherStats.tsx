import { useParams } from "react-router-dom";
import { variables } from "./Variables.tsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface PitcherStat {
  id: number;
  game_date: Date;
  game_result: string;
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
  starts: number;
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
}

const PitcherStats = () => {
  const [pitcherStats, setPitcherStats] = useState<PitcherStat[]>([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();
  const player_id = parseInt(id || "-1");

  const three_decimals = (value: number) => {
    return value.toFixed(3);
  };

  useEffect(() => {
    const fetchPitchingStats = async () => {
      try {
        const response = await fetch(
          `${variables.API_BASE_URL}pitcher_stats/?player_id=${player_id}`
        );
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();
        console.log("Batter stats data:", data);
        setPitcherStats(data);
      } catch (error) {
        console.error(
          "Error fetching pitching stats for " + player_id + ": " + error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPitchingStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="m-3">{pitcherStats[0].player_name} Pitching Game Log</h1>

      <ul>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse bg-gray-50 text-black w-full">
            <thead className="bg-gray-300 text-orange-600">
              <tr>
                <th className="px-5 border border-gray-400">Date</th>
                <th className="px-2 border border-gray-400">Result</th>
                <th className="px-2 border border-gray-400" title="Decision">
                  Dec
                </th>

                <th className="px-2 border border-gray-400" title="At-bats">
                  AB
                </th>
                <th className="px-2 border border-gray-400" title="Runs">
                  R
                </th>
                <th className="px-2 border border-gray-400" title="Hits">
                  H
                </th>
                <th className="px-2 border border-gray-400" title="Doubles">
                  2B
                </th>
                <th className="px-2 border border-gray-400" title="Triples">
                  3B
                </th>
                <th className="px-2 border border-gray-400" title="Home Runs">
                  HR
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Runs Batted In"
                >
                  RBI
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Stolen Bases"
                >
                  SB
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Caught Stealing"
                >
                  CS
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Walk (Base on Balls)"
                >
                  BB
                </th>
                <th className="px-2 border border-gray-400" title="Strikeout">
                  SO
                </th>
                <th
                  className="px-4 border border-gray-400"
                  title="Batting Average"
                >
                  BA
                </th>
                <th className="px-2 border border-gray-400" title="Total Bases">
                  TB
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Hit into Double Play"
                >
                  DP
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Hit by Pitch"
                >
                  HBP
                </th>
                <th className="px-2 border border-gray-400" title="Sac Bunt">
                  SH
                </th>
                <th className="px-2 border border-gray-400" title="Sac Fly">
                  SF
                </th>
                <th
                  className="px-2 border border-gray-400"
                  title="Intentional Walk"
                >
                  IBB
                </th>
              </tr>
            </thead>
            <tbody>
              {pitcherStats.map((stat) => (
                <tr key={stat.id} className="border border-gray-200">
                  <td className="px-2 border border-gray-300">
                    {stat.game_date}
                  </td>
                  <td className="px-2 border border-gray-300">
                    <Link
                      to={stat.box_score_link.toString()}
                      className="text-blue-500 hover:underline"
                      title="View Box Score"
                    >
                      {stat.game_result}
                    </Link>
                  </td>
                  <td className="px-5 border border-gray-300">{stat.pa}</td>
                  <td className="px-3 border border-gray-300">{stat.ab}</td>
                  <td className="px-2 border border-gray-300">{stat.runs}</td>
                  <td className="px-2 border border-gray-300">{stat.hits}</td>
                  <td className="px-2 border border-gray-300">{stat.double}</td>
                  <td className="px-2 border border-gray-300">{stat.triple}</td>
                  <td className="px-2 border border-gray-300">{stat.hr}</td>
                  <td className="px-2 border border-gray-300">{stat.rbi}</td>
                  <td className="px-2 border border-gray-300">{stat.sb}</td>
                  <td className="px-2 border border-gray-300">{stat.cs}</td>
                  <td className="px-2 border border-gray-300">{stat.bb}</td>
                  <td className="px-2 border border-gray-300">{stat.so}</td>
                  <td className="px-3 border border-gray-300">
                    {three_decimals(stat.avg)}
                  </td>
                  <td className="px-2 border border-gray-300">{stat.tb}</td>
                  <td className="px-2 border border-gray-300">{stat.dp}</td>
                  <td className="px-2 border border-gray-300">{stat.hbp}</td>
                  <td className="px-2 border border-gray-300">{stat.sh}</td>
                  <td className="px-2 border border-gray-300">{stat.sf}</td>
                  <td className="px-2 border border-gray-300">{stat.ibb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ul>
    </div>
  );
};

export default PitcherStats;
