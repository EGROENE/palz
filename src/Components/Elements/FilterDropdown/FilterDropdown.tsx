import { useState } from "react";

const FilterDropdown = ({
  dropdownBtnText,
  filterOptions,
  activeFilters,
  handleAddDeleteFilter,
}: {
  dropdownBtnText: string;
  filterOptions: string[];
  activeFilters: string[];
  setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  handleAddDeleteFilter: (option: string) => void;
}) => {
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

  const toggleShowFilterOptions = (): void => setShowFilterOptions(!showFilterOptions);

  return (
    <div className="filter-container">
      <button onClick={() => toggleShowFilterOptions()}>
        {dropdownBtnText}
        <i
          className="fas fa-chevron-down"
          style={showFilterOptions ? { rotate: "180deg" } : undefined}
        ></i>
      </button>
      {showFilterOptions && (
        <div className="filter-options-container">
          {filterOptions.map((option) => (
            <div key={option}>
              <span>{option}</span>
              <input
                type="checkbox"
                onChange={() => handleAddDeleteFilter(option)}
                checked={activeFilters.includes(option)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default FilterDropdown;
