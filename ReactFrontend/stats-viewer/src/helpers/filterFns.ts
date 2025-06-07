import { type FilterFn } from "@tanstack/react-table";
export const greaterThanOrEqualTo: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);
  return typeof cellValue === "number" && cellValue >= parseFloat(value);
};