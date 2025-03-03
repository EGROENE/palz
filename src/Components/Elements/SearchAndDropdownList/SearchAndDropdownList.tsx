import React, { ReactNode } from "react";

const SearchAndDropdownList = ({
  name,
  id,
  inputRef,
  onFocus,
  onBlur,
  style,
  isDisabled,
  inputOnChange,
  placeholder,
  query,
  clearQueryOnClick,
  randomColor,
  showList,
  setShowList,
  dropdownChecklist,
}: {
  name: string;
  id: string;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  style?: React.CSSProperties | undefined;
  isDisabled?: boolean;
  inputOnChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  query: string;
  clearQueryOnClick: React.MouseEventHandler<HTMLElement>;
  randomColor?: string;
  showList: boolean;
  setShowList: (value: React.SetStateAction<boolean>) => void;
  dropdownChecklist: ReactNode;
}) => {
  return (
    <div className="search-and-dropdown">
      <input
        name={name}
        id={id}
        className="dropdown-search"
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        disabled={isDisabled}
        value={query}
        onChange={inputOnChange}
        type="text"
        placeholder={placeholder}
      />
      {query.replace(/s\+/g, "") !== "" && (
        <i
          onClick={clearQueryOnClick}
          className="clear-other-users-search-query fas fa-times"
        ></i>
      )}
      <div className="dropdownList">
        <button
          style={
            randomColor === "var(--primary-color)"
              ? { backgroundColor: `${randomColor}`, color: "black" }
              : { backgroundColor: `${randomColor}`, color: "white" }
          }
          disabled={isDisabled}
          type="button"
          onClick={() => setShowList(!showList)}
        >
          Select user:
          <i
            style={showList ? { "rotate": "180deg" } : undefined}
            className="fas fa-chevron-down"
          ></i>
        </button>
        {showList && dropdownChecklist}
      </div>
    </div>
  );
};
export default SearchAndDropdownList;
