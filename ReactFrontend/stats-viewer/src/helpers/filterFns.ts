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

export const dateFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue: Array<Date>
) => {
  if (!filterValue || filterValue.length !== 2) {
    return true;
  }
  const [filterStart, filterEnd] = filterValue;
  const date = new Date(row.getValue(columnId));
  const startDate = new Date(filterStart);
  const endDate = new Date(filterEnd);
  return date >= startDate && date <= endDate;
};
