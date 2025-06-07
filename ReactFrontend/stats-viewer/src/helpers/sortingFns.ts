import { type SortingFn} from "@tanstack/react-table";
import type { Row } from "@tanstack/react-table";
import type { AllPitchingStat } from "../types/statTypes.tsx";

export const dashStatSortingFn: SortingFn<any> = (rowA, rowB, columnId) => {
  const dashStatA: string = rowA.getValue(columnId);
  const dashStatB: string = rowB.getValue(columnId);

  const regex = RegExp(/^(\d+)-(\d+)/);

  const statA = dashStatA.match(regex);
  const statB = dashStatB.match(regex);

  const statA1 = statA ? parseInt(statA[1], 10) : null;
  const statA2 = statA ? parseInt(statA[2], 10) : null;
  const statB1 = statB ? parseInt(statB[1], 10) : null;
  const statB2 = statB ? parseInt(statB[2], 10) : null;

  if (statA1 === null || statA2 === null) {
    return (
      new Date(rowA.getValue("game_date")).getTime() -
      new Date(rowB.getValue("game_date")).getTime()
    );
  }
  if (statB1 === null || statB2 === null) {
    return (
      new Date(rowA.getValue("game_date")).getTime() -
      new Date(rowB.getValue("game_date")).getTime()
    );
  }

  if (statA2 === 0 && statB2 === 0) {
    return 0;
  }
  if (statA2 === 0) {
    if (statB1 === 0) {
      return 1;
    }
    return -1;
  } // A comes after B
  if (statB2 === 0) {
    if (statA1 === 0) {
      return -1;
    }
    return 1;
  } // B comes after A
  if (statA1 / statA2 === 0 && statB1 / statB2 === 0) {
    return statB2 - statA2; // Sort by more hits
  }
  if (statA1 / statA2 === 1 && statB1 / statB2 === 1) {
    return statA1 - statB1; // Sort by more hits
  }

  return statA1 / statA2 - statB1 / statB2; // Sort by ratio
};

export const byQualifiedEra: SortingFn<AllPitchingStat> = (
  rowA: Row<AllPitchingStat>,
  rowB: Row<AllPitchingStat>
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


