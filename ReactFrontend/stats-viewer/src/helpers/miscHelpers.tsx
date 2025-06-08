export const min_plate_appearance = 3.0;

export const min_innings_pitched = 1.0;

export const batterSeasonTotalHeader = (
  <div className="flex flex-col gap-2">
    <div>
      <span className="font-bold">Bold</span>: Qualified batter (
      {min_plate_appearance.toFixed(1)} PA per team game)
    </div>
  </div>
);

export const pitcherSeasonTotalHeader = (
  <div className="flex flex-col gap-2">
    <div>
      <span className="font-bold">Bold</span>: Qualified pitcher (
      {min_innings_pitched.toFixed(1)} IP per team game)
    </div>
  </div>
);

export function getColumnSum(info: any, column_id: string) {
  const total = info.table
    .getFilteredRowModel()
    .rows.reduce(
      (sum: number, row: any) => sum + parseInt(row.getValue(column_id)),
      0
    );
  return total;
}

export const dot_and_three_decimals = (value: number) => {
  if (value == null || isNaN(value)) {
    return "--";
  }
  const rounded = value.toFixed(3);
  return rounded.startsWith("0.") ? rounded.slice(1) : rounded;
};
