import { type FilterFn } from "@tanstack/react-table";
export const greaterThanOrEqualTo: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);
  return typeof cellValue === "number" && cellValue >= parseFloat(value);
};

export const compareOperatorFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue
) => {
  const rowValue = row.getValue(columnId);

  if (!filterValue || typeof filterValue !== "object") return true;

  console.log;

  const { op, value } = filterValue;

  if (typeof rowValue !== "number" || typeof value !== "number") return true;

  switch (op) {
    case "gte":
      return rowValue >= value;
    case "lte":
      return rowValue <= value;
    case "e":
    default:
      return rowValue === value;
  }
};
