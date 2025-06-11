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

  const handleQualifiedToggle = () => {
    const newValue = !qualifiedOnly;
    setQualifiedOnly(newValue);
    console.log("Qualified Only:", newValue);
    const updatedFilters = columnFilters.filter((f) => f.id !== "qualified");
    if (newValue) {
      updatedFilters.push({ id: "qualified", value: true });
    }

    setColumnFilters(updatedFilters);
  };

  return (
    <ul className="justify-center items-center space-x-4 mb-6 text-white font-medium">
      {options.map((label, index) => (
        <div key={index}>
          {label[0] === "game_date" ? (
            <div className="flex flex-row space-x-4">
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
            <div className="flex items-center space-x-2 bg-green-600 px-3 py-2 rounded-full mb-2">
              <input
                type="checkbox"
                checked={qualifiedOnly}
                onChange={handleQualifiedToggle}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-white">{label[1]}</span>
            </div>
          ) : (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full mb-2">
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

                  setCachedColumnFilters(newFilters);
                  console.log("Label:", label[0]);
                  console.log("Input Value:", inputValue);
                  console.log("ON CHANGE: CACHED:", cachedColumnFilters);
                }}
                className="w-10 text-center"
              />
            </div>
          )}

          {/* {label[0] !== "qualified" && (
            <li
              className="border-1 px-2 py-1 rounded-full cursor-pointer bg-blue-500 text-white text-center"
              onClick={() => {
                const filtersWithoutCurrent = columnFilters.filter(
                  (f) => f.id !== label[0]
                );
                if (label[0] === "game_date") {
                  setColumnFilters([
                    ...filtersWithoutCurrent,
                    {
                      id: label[0],
                      value:
                        dateRange[0] && dateRange[1]
                          ? [new Date(dateRange[0]), new Date(dateRange[1])]
                          : "",
                    },
                  ]);
                } else {
                  // cachedColumnFilters = [
                  //   ...filtersWithoutCurrent,
                  //   {
                  //     id: label[0],
                  //     value: inputValue[index] ? [inputValue[index]] : "",
                  //   },
                  // ];
                  // console.log("CACHED:", cachedColumnFilters);
                  setColumnFilters([
                    ...filtersWithoutCurrent,
                    {
                      id: label[0],
                      value: inputValue[index] ? [inputValue[index]] : "",
                    },
                  ]);
                  console.log("REAL:", columnFilters);
                }
              }}
            >
              {label[1]}
            </li>
          )} */}
        </div>
      ))}
      <li
        className="px-5 w-50 rounded-full bg-green-500 cursor-pointer text-center"
        onClick={() => {
          setColumnFilters(cachedColumnFilters);
          console.log("Filters set:", cachedColumnFilters);
          console.log("Column Filters:", columnFilters);
        }}
      >
        Set Filters
      </li>
      <li
        className="px-5 mt-1 w-50 rounded-full bg-red-700 cursor-pointer text-center"
        onClick={() => {
          setColumnFilters([]);
          setInputValue(Array(options.length).fill(""));
          setDateRange(["", "2025-06-01"]);
          setQualifiedOnly(false);
          console.log("Filters cleared");
        }}
      >
        Clear Filters
      </li>
    </ul>
  );
};

export default FilterGUI;
