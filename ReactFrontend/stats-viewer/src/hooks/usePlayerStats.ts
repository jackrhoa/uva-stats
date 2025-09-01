import { useEffect, useState } from "react";

export interface UsePlayerStatsProps {
  API_BASE_URL: string;
  statsToReceive: string[];
}

export const usePlayerStats = ({
  API_BASE_URL,
  statsToReceive,
}: UsePlayerStatsProps) => {
  const [playerData, setPlayerData] = useState<Partial<Record<string, any[]>>>(
    {} as any
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const newData: Partial<Record<string, any[]>> = {} as any;

        for (const stat of statsToReceive) {
          const response = await fetch(`${API_BASE_URL}${stat}`);
          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
          }
          const json = await response.json();
          newData[stat.split("?")[0] || "unknown"] = json;
        }
        setPlayerData(newData);
      } catch (err: any) {
        setError(
          err.message ||
            "An unknown error occurred while fetching player stats."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_BASE_URL, statsToReceive]);
  return { playerData, loading, error };
};

export default usePlayerStats;
