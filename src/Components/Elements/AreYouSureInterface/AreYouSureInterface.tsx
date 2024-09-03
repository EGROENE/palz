import { TThemeColor } from "../../../types";
import styles from "./styles.module.css";

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
    <div className={styles.modalBackground}>
      <div className={styles.areYouSureModal}>
        <header style={{ color: randomColor }}>{message}</header>
        <p>{subheader}</p>
        <div className={styles.buttonsContainer}>
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
