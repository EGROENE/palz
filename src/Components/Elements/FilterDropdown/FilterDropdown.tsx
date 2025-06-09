import styles from "./styles.module.css";
import { TThemeColor, TDisplayedCardsFilter } from "../../../types";

const FilterDropdown = ({
  dropdownBtnText,
  filterOptions,
  activeFilters,
  handleAddDeleteFilter,
  handleClearActiveFilters,
  showFilterOptions,
  toggleShowFilterOptions,
  randomColor,
}: {
  dropdownBtnText: string;
  filterOptions: TDisplayedCardsFilter[];
  activeFilters: TDisplayedCardsFilter[];
  handleAddDeleteFilter: (option: TDisplayedCardsFilter) => void;
  handleClearActiveFilters: () => void;
  showFilterOptions: boolean;
  toggleShowFilterOptions: () => void;
  randomColor?: TThemeColor;
}) => {
  return (
    <div className={styles.filterContainer}>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <div className="theme-element-container">
          <button className={styles.button} onClick={() => toggleShowFilterOptions()}>
            {dropdownBtnText}
            <i
              className="fas fa-chevron-down"
              style={showFilterOptions ? { rotate: "180deg" } : undefined}
            ></i>
          </button>
        </div>
        {activeFilters.length > 0 && (
          <span
            onClick={() => handleClearActiveFilters()}
            style={{ marginLeft: "0.5rem" }}
            className="remove-data"
          >
            Reset all
          </span>
        )}
      </div>
      {showFilterOptions && (
        <div className={styles.filterOptionsContainer}>
          {filterOptions.map((option) => (
            <label
              tabIndex={0}
              aria-hidden="false"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddDeleteFilter(option);
                }
              }}
              key={option}
            >
              <span>{option}</span>
              <input
                name={option}
                id={option}
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
