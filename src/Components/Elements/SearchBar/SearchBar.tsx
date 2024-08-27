import { TThemeColor } from "../../../types";

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
}: {
  input: string;
  placeholder: string;
  inputHandler: (input: string) => void;
  clearInputHandler: () => void;
  isSideButton: boolean;
  sideButtonText?: string;
  sideButtonIsDisabled?: boolean;
  addMethod: (input: string, e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  randomColor?: TThemeColor;
}) => {
  return (
    <div className="add-interests-bar">
      <input
        value={input}
        onChange={(e) => inputHandler(e.target.value)}
        type="text"
        placeholder={placeholder}
      />
      {input !== "" && (
        <i title="Clear" onClick={() => clearInputHandler()} className="fas fa-times"></i>
      )}
      {isSideButton && (
        <button
          onClick={(e) => {
            addMethod(input, e);
            clearInputHandler();
          }}
          disabled={sideButtonIsDisabled}
          style={{ backgroundColor: randomColor }}
        >
          {sideButtonText}
        </button>
      )}
    </div>
  );
};
export default SearchBar;
