import { type BattingStat } from "../types/statTypes";

export type BattingSeasonStat = BattingStat & {
  games_played: number;
};

export default function getSeasonStats(
  playerGameStats: BattingStat[]
): BattingSeasonStat {
  const partialStat = playerGameStats.reduce<Partial<BattingSeasonStat>>(
    (acc, stat) => {
      acc.player_id = stat.player_id;
      acc.player_name = stat.player_name;
      acc.hr = (acc.hr || 0) + stat.hr;
      acc.games_played = (acc.games_played || 0) + 1;
      return acc;
    },
    {}
    //       player_id: "",
    //       player_name: "",
    //       hr: 0,
    //       rbi: 0,
    //       player_position: "",
    //       games_played: 0,
    //     } as Partial<BattingSeasonStat>
    //   );
  );
  return partialStat as unknown as BattingSeasonStat; // This line is not needed, but kept for type consistency
}

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function getGroupedSeasonStats(
  playerGameStats: BattingStat[],
  keyFn: (stat: BattingStat) => string
): BattingStat[] {
  const grouped = groupBy(playerGameStats, keyFn);
  return Object.values(grouped).map(getSeasonStats);
}
