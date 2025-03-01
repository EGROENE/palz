import React, { ReactNode } from "react";
import { TUser, TEvent } from "../../../types";

type TDropdownChecklist = ({
  usedFor,
  action,
  actionParams,
  actionEventParamNeeded,
  displayedItemsArray,
  storageArray,
  setStorageArray,
  displayedItemsCount,
  setDisplayedItemsCount,
  displayedItemsCountInterval,
  event,
}: {
  usedFor: string;
  action: Function;
  actionParams?: any[];
  actionEventParamNeeded: boolean;
  displayedItemsArray: TUser[];
  storageArray: any[];
  setStorageArray: React.Dispatch<React.SetStateAction<any[]>>;
  displayedItemsCount: number | null;
  setDisplayedItemsCount: React.Dispatch<React.SetStateAction<number | null>>;
  displayedItemsCountInterval?: number;
  event?: TEvent;
}) => JSX.Element;

const SearchAndDropdownList = ({
  name,
  id,
  ref,
  onFocus,
  onBlur,
  style,
  isDisabled,
  value,
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
  ref?: React.MutableRefObject<HTMLInputElement | null>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  style?: React.CSSProperties | undefined;
  isDisabled?: boolean;
  value: string;
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
        name="potential-invitees-search"
        id="potential-invitees-search"
        className="dropdown-search"
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        disabled={isDisabled}
        value={query}
        onChange={inputOnChange}
        type="text"
        placeholder="Search users by username, first/last names"
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
