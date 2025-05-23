export interface BatterStat {
  id: number;
  player_id: number | null; // null allowed due to `null=True`
  player_name?: string;
  game_id: number;
  ab: number;
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
