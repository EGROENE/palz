import { useState } from "react";
import styles from "./styles.module.css";
import { TThemeColor } from "../../../types";

const FilterDropdown = ({
  dropdownBtnText,
  filterOptions,
  activeFilters,
  handleAddDeleteFilter,
  randomColor,
}: {
  dropdownBtnText: string;
  filterOptions: string[];
  activeFilters: string[];
  setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  handleAddDeleteFilter: (option: string) => void;
  randomColor?: TThemeColor;
}) => {
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

  const toggleShowFilterOptions = (): void => setShowFilterOptions(!showFilterOptions);

  return (
    <div className={styles.filterContainer}>
      <button className={styles.button} onClick={() => toggleShowFilterOptions()}>
        {dropdownBtnText}
        <i
          className="fas fa-chevron-down"
          style={showFilterOptions ? { rotate: "180deg" } : undefined}
        ></i>
      </button>
      {showFilterOptions && (
        <div className={styles.filterOptionsContainer}>
          {filterOptions.map((option) => (
            <label key={option}>
              <span>{option}</span>
              <input
                type="checkbox"
                style={{ accentColor: randomColor }}
                onChange={() => handleAddDeleteFilter(option)}
                checked={activeFilters.includes(option)}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
export default FilterDropdown;
