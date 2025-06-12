import type { ColumnFiltersState } from "@tanstack/react-table";
import { useState } from "react";

interface ColumnFiltersProps {
  options: [string, string][]; // [filter_id, label]
  columnFilters: ColumnFiltersState;
  setColumnFilters([]: ColumnFiltersState): void;
}

const FilterGUI: React.FC<ColumnFiltersProps> = ({
  options,
  columnFilters,
  setColumnFilters,
}) => {
  const [inputValue, setInputValue] = useState<string[]>(
    Array(options.length).fill("")
  );
  const [dateRange, setDateRange] = useState<[string, string]>([
    "",
    "2025-06-01",
  ]);
  const [qualifiedOnly, setQualifiedOnly] = useState<boolean>(false);
  const [cachedColumnFilters, setCachedColumnFilters] =
    useState<ColumnFiltersState>(columnFilters);
  const [cachedNumericalColumnFilters, setCachedNumericalColumnFilters] =
    useState<
      {
        id: string;
        op: string;
        value: string;
      }[]
    >([]);

  const hasDate = options.some(([id]) => id === "game_date");
  const hasQualified = options.some(([id]) => id === "qualified");

  const applyFilters = () => {
    const newFilters: ColumnFiltersState = [];

    if (hasDate && dateRange[0] && dateRange[1]) {
      newFilters.push({
        id: "game_date",
        value: [new Date(dateRange[0]), new Date(dateRange[1])],
      });
    }

    if (hasQualified && qualifiedOnly) {
      newFilters.push({ id: "qualified", value: qualifiedOnly });
    }

    cachedNumericalColumnFilters.forEach(({ id, op, value }) => {
      if (value.trim()) {
        newFilters.push({
          id,
          value: { op, value: Number(value) },
        });
      }
    });

    setColumnFilters(newFilters);
  };

  const handleQualifiedToggle = () => {
    const newValue = !qualifiedOnly;
    console.log("Toggling qualified filter:", newValue);
    setQualifiedOnly(newValue);
    console.log("Qualified Only:", newValue);
    const updatedFilters = cachedColumnFilters.filter(
      (f) => f.id !== "qualified"
    );
    if (newValue) {
      updatedFilters.push({ id: "qualified", value: true });
    }

    setCachedColumnFilters(updatedFilters);
  };
  const handleFilterChange = (index: number, key: string, value: string) => {
    const updated = [...cachedNumericalColumnFilters];
    (updated[index] as any)[key] = value;
    setCachedNumericalColumnFilters(updated);
  };

  return (
    <ul className="justify-center items-center space-x-4 mb-6 text-white font-medium">
      {options.map((label, index) => (
        <div key={index}>
          {label[0] === "game_date" ? (
            <div
            // className="flex flex-row space-x-4"
            >
              <div className="flex flex-col items-center mb-2">
                <span className="text-black">Start Date</span>
                <input
                  type="date"
                  value={dateRange[0]}
                  onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                  className="bg-gray-200 text-black px-2 py-1 rounded-full mb-2"
                />
              </div>
              <div className="flex flex-col items-center mb-2">
                <span className="text-black">End Date</span>
                <input
                  type="date"
                  value={dateRange[1]}
                  onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                  className="bg-gray-200 text-black px-2 py-1 rounded-full mb-2"
                />
              </div>
            </div>
          ) : label[0] === "qualified" ? (
            <div className="flex items-center space-x-2 bg-blue-600 px-14 py-2 rounded-full mb-1">
              <input
                type="checkbox"
                checked={qualifiedOnly}
                onChange={handleQualifiedToggle}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-white">{label[1]}</span>
            </div>
          ) : (
            <div
              //  className="bg-blue-600 text-white px-1 py-0.5 rounded-full mb-1 text-sm"
              className="flex items-center space-x-2 py-1 mb-1 bg-blue-600 rounded-full px-3"
            >
              <input
                type="text"
                value={inputValue[index]}
                placeholder={label[1]}
                onChange={(e) => {
                  const updated = [...inputValue];
                  updated[index] = e.target.value;
                  setInputValue(updated);
                  const filtersWithoutCurrent = columnFilters.filter(
                    (f) => f.id !== label[0]
                  );
                  const value = e.target.value;
                  const newFilters = [...filtersWithoutCurrent];
                  if (value.trim() !== "") {
                    newFilters.push({
                      id: label[0],
                      value: [value],
                    });
                  }

                  // Update cachedNumericalColumnFilters for this input
                  const updatedNumericalFilters = [
                    ...cachedNumericalColumnFilters,
                  ];

                  while (updatedNumericalFilters.length <= index) {
                    updatedNumericalFilters.push({
                      id: "",
                      op: "gte",
                      value: "",
                    });
                  }

                  updatedNumericalFilters[index] = {
                    id: label[0],
                    op: updatedNumericalFilters[index]?.op || "gte",
                    value: e.target.value,
                  };
                  setCachedNumericalColumnFilters(updatedNumericalFilters);
                  console.log(
                    "cached NUM FILTERS:",
                    cachedNumericalColumnFilters
                  );
                  console.log("Label:", label[0]);
                  console.log("Input Value:", inputValue);
                  console.log("ON CHANGE: CACHED:", cachedColumnFilters);
                }}
                className="w-31.5 text-center"
              />
              <select
                name="Hello"
                id="operator"
                className="bg-gray-200 text-black px-2 py-1 rounded-full"
                onChange={(e) => {
                  handleFilterChange(index, "op", e.target.value);
                  console.log("Operator changed:", e.target.value);
                }}
              >
                <option value="gte">&gt;=</option>
                <option value="e">=</option>
                <option value="lte">&lt;=</option>
              </select>
            </div>
          )}
        </div>
      ))}

      <li
        className="px-5 w-50 rounded-full bg-green-600 cursor-pointer text-center hover:bg-green-700 p-0.5"
        onClick={() => {
          applyFilters();
        }}
      >
        Apply Filters
      </li>
      <li
        className="px-5 mt-1 w-50 rounded-full bg-red-700 cursor-pointer text-center hover:bg-red-800 p-0.5"
        onClick={() => {
          setColumnFilters([]);
          setInputValue(Array(options.length).fill(""));
          setDateRange(["", "2025-06-01"]);
          setQualifiedOnly(false);
          setCachedColumnFilters([]);
        }}
      >
        Clear Filters
      </li>
      {/* {(JSON.stringify(cachedColumnFilters) !== JSON.stringify(columnFilters) ||
        cachedNumericalColumnFilters.length > 0) && (
        <div className="text-red-500 text-sm mb-2">
          Click "Apply Filters" to save changes
        </div>
      )} */}
    </ul>
  );
};

export default FilterGUI;
