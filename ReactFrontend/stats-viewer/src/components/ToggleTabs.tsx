interface ToggleTabProps {
  options: string[];
  toggle: number;
  setToggle(index: number): void;
}

const ToggleTabs: React.FC<ToggleTabProps> = ({
  options,
  toggle,
  setToggle,
}) => {
  return (
    <ul className="flex justify-center items-center space-x-4 mb-6 text-white font-medium mt-18">
      {options.map((label, index) => (
        <li
          key={index}
          className={`border-1 px-2 py-1 rounded-full cursor-pointer
            ${
              toggle === index
                ? "bg-blue-600 text-white text-semibold border-transparent"
                : "border-gray text-gray-500 hover:bg-blue-300"
            }
            `}
          onClick={() => setToggle(index)}
        >
          {label}
        </li>
      ))}
    </ul>
  );
};

export default ToggleTabs;
