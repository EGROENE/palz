import { TThemeColor } from "../../../types";

type TAreYouSureInterfaceProps = {
  message: string;
  subheader?: string;
  noButtonText: string;
  yesButtonText: string;
  setShowAreYouSureInterface: React.Dispatch<React.SetStateAction<boolean>>;
  executionHandler: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  randomColor: TThemeColor | undefined;
};

const AreYouSureInterface = ({
  message,
  subheader,
  noButtonText,
  yesButtonText,
  setShowAreYouSureInterface,
  executionHandler,
  randomColor,
}: TAreYouSureInterfaceProps) => {
  return (
    <div className="modal-background">
      <div className="are-you-sure-modal">
        <header style={{ color: randomColor }}>{message}</header>
        <p>{subheader}</p>
        <div className="buttons-container">
          <button onClick={() => setShowAreYouSureInterface(false)}>
            {noButtonText}
          </button>
          <button
            style={{ backgroundColor: randomColor }}
            onClick={(e) => executionHandler(e)}
          >
            {yesButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AreYouSureInterface;
