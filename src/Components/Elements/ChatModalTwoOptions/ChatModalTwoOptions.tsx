import { TThemeColor } from "../../../types";

const ChatModalTwoOptions = ({
  buttonOneHandler,
  buttonOneText,
  buttonTwoHandler,
  buttonTwoText,
  header,
  subheader,
  randomColor,
}: {
  buttonOneHandler?: React.MouseEventHandler<HTMLButtonElement>;
  buttonOneText: string;
  buttonTwoHandler?: React.MouseEventHandler<HTMLButtonElement>;
  buttonTwoText: string;
  header: string;
  subheader?: string;
  randomColor?: TThemeColor;
}) => {
  return (
    <div className="chat-modal-two-options-hero">
      <header style={{ color: randomColor }}>{header}</header>
      {subheader && <header className="subheader">{subheader}</header>}
      <div className="chat-modal-two-options-buttons-container">
        <button onClick={buttonOneHandler}>{buttonOneText}</button>
        <button
          style={
            randomColor === "var(--primary-color)"
              ? { backgroundColor: `${randomColor}`, color: "black" }
              : { backgroundColor: `${randomColor}`, color: "white" }
          }
          onClick={buttonTwoHandler}
        >
          {buttonTwoText}
        </button>
      </div>
    </div>
  );
};
export default ChatModalTwoOptions;
