import { useState } from "react";

const FilterDropdown = ({
  dropdownBtnText,
  filterOptions,
  activeFilters,
  setActiveFilters,
}: {
  dropdownBtnText: string;
  filterOptions: string[];
  activeFilters: string[];
  setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

  const toggleShowFilterOptions = (): void => setShowFilterOptions(!showFilterOptions);

  const handleAddDeleteFilter = (option: string): void => {
    activeFilters.includes(option)
      ? setActiveFilters(activeFilters.filter((o) => o !== option))
      : setActiveFilters(activeFilters.concat(option));
  };

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
            <div>
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
