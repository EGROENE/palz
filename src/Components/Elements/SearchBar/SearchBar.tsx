import { TThemeColor } from "../../../types";
import styles from "./styles.module.css";

const SearchBar = ({
  input,
  placeholder,
  inputHandler,
  clearInputHandler,
  isSideButton,
  sideButtonText,
  sideButtonIsDisabled,
  addMethod,
  randomColor,
  title,
  searchBoxRef,
  searchBoxIsFocused,
  setSearchBoxIsFocused,
  numberOfResults,
}: {
  input: string;
  placeholder: string;
  inputHandler: any;
  clearInputHandler: () => void;
  isSideButton: boolean;
  sideButtonText?: string;
  sideButtonIsDisabled?: boolean;
  addMethod?: (input: string, e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  randomColor?: TThemeColor;
  title?: string;
  searchBoxRef?: React.MutableRefObject<HTMLInputElement | null>;
  searchBoxIsFocused?: boolean;
  setSearchBoxIsFocused?: React.Dispatch<React.SetStateAction<boolean>>;
  numberOfResults?: number;
}) => {
  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.bar}>
        <input
          ref={searchBoxRef}
          title={title ? title : undefined}
          value={input}
          onChange={(e) => inputHandler(e.target.value)}
          type="text"
          placeholder={placeholder}
          onFocus={setSearchBoxIsFocused ? () => setSearchBoxIsFocused(true) : undefined}
          onBlur={setSearchBoxIsFocused ? () => setSearchBoxIsFocused(false) : undefined}
          style={
            searchBoxIsFocused
              ? {
                  boxShadow: `0px 0px 10px 2px ${randomColor}`,
                  outline: "none",
                }
              : undefined
          }
        />
        {input !== "" && (
          <i
            title="Clear"
            onClick={() => clearInputHandler()}
            className="fas fa-times"
          ></i>
        )}
        {isSideButton && (
          <button
            onClick={(e) => {
              if (addMethod) {
                addMethod(input, e);
                clearInputHandler();
              }
            }}
            disabled={sideButtonIsDisabled}
            style={{ backgroundColor: randomColor }}
          >
            {sideButtonText}
          </button>
        )}
      </div>
      {numberOfResults && input !== "" && (
        <p>
          {numberOfResults === 1
            ? `${numberOfResults} result`
            : `${numberOfResults} results`}
        </p>
      )}
    </div>
  );
};
export default SearchBar;