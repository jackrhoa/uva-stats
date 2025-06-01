import type { ColumnFiltersState } from "@tanstack/react-table";
import { useState } from "react";

interface ColumnFiltersProps {
  options: [string, string][];
  columnFilters: ColumnFiltersState;
  setColumnFilters([]: ColumnFiltersState): void;
}

const ToggleTabs: React.FC<ColumnFiltersProps> = ({
  options,
  columnFilters,
  setColumnFilters,
}) => {
  const [inputValue, setInputValue] = useState<string[]>([
    ...Array(options.length).fill(""),
  ]);
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);
  return (
    <ul className="flex justify-center items-center space-x-4 mb-6 text-white font-medium">
      {options.map((label, index) => (
        <div>
          <div>
            {label[0] === "game_date" ? (
              <div className="flex flex-row space-x-4">
                <div className="flex flex-col items-center mb-2">
                  <span className="text-black">Start Date</span>
                  <input
                    type="date"
                    value={dateRange[0]}
                    onChange={(e) => {
                      setDateRange([e.target.value, dateRange[1]]);
                    }}
                    placeholder="Start Date"
                    className="bg-gray-200 text-black px-2 py-1 rounded-full mb-2"
                  />
                </div>
                <div className="flex flex-col items-center mb-2">
                  <span className="text-black">End Date</span>
                  <input
                    type="date"
                    value={dateRange[1]}
                    onChange={(e) => {
                      setDateRange([dateRange[0], e.target.value]);
                    }}
                    placeholder="End Date"
                    className="bg-gray-200 text-black px-2 py-1 rounded-full mb-2"
                  />
                </div>
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
                  }}
                />
              </div>
            )}
          </div>
          <li
            key={index}
            className={`border-1 px-2 py-1 rounded-full cursor-pointer bg-blue-500 text-white`}
            // className={`border-1 px-2 py-1 rounded-full cursor-pointer ${
            //   columnFilters[index].value != null
            //     ? "bg-blue-600 text-white text-semibold border-transparent"
            //     : "border-gray text-gray-500 hover:bg-blue-300"
            // }`}
            onClick={() => {
              {
                label[0] === "game_date"
                  ? setColumnFilters([
                      ...columnFilters,
                      {
                        id: label[0],
                        value:
                          dateRange[0] && dateRange[1]
                            ? [new Date(dateRange[0]), new Date(dateRange[1])]
                            : "",
                      },
                    ])
                  : setColumnFilters([
                      ...columnFilters,
                      {
                        id: label[0],
                        value: inputValue[index] ? [inputValue[index]] : "",
                      },
                    ]);
              }
              //   setColumnFilters([
              //     ...columnFilters,
              //     {
              //       id: label[0],
              //       //   value: [new Date("2025-04-01"), new Date("2025-04-25")],
              //       value: inputValue[index] ? [inputValue[index]] : "",
              //       // document.getElementById("filterValue")?.ariaValueText || "",
              //     },
              //   ]);
              console.log(
                `Filter set for ${label}: ${columnFilters[index]?.value} (${inputValue})`
              );
            }}
          >
            {label[1]}
          </li>
        </div>
      ))}
    </ul>
  );
};

export default ToggleTabs;
