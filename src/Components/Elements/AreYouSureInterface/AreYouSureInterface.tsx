import { TThemeColor } from "../../../types";
import FileUploadWithButton from "../FileUploadWithButton/FileUploadWithButton";
import styles from "./styles.module.css";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useState, useEffect } from "react";

type TAreYouSureInterfaceProps = {
  header: string;
  subheader?: string;
  buttonTwoText: string;
  buttonOneText: string;
  setShowAreYouSureInterface: React.Dispatch<React.SetStateAction<boolean>>;
  executionHandler?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isFileUpload?: boolean;
  removeFile?: Function;
};

const AreYouSureInterface = ({
  header,
  subheader,
  buttonTwoText,
  buttonOneText,
  setShowAreYouSureInterface,
  executionHandler,
  isFileUpload,
  removeFile,
}: TAreYouSureInterfaceProps) => {
  const { handleProfileImageUpload, profileImage } = useUserContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  return (
    <div className={styles.modalBackground}>
      {isFileUpload && (
        <i
          title="Close"
          onClick={() => setShowAreYouSureInterface(false)}
          className="fas fa-times close-module-icon"
        ></i>
      )}
      <div className={styles.areYouSureModal}>
        {!isFileUpload ? (
          <>
            <header style={{ color: randomColor }}>{header}</header>
            {subheader && <p>{subheader}</p>}
            <div className={styles.buttonsContainer}>
              <button onClick={() => setShowAreYouSureInterface(false)}>
                {buttonOneText}
              </button>
              <button
                style={{ backgroundColor: randomColor }}
                onClick={executionHandler ? (e) => executionHandler(e) : undefined}
              >
                {buttonTwoText}
              </button>
            </div>
          </>
        ) : (
          <>
            <header style={{ color: randomColor }}>{header}</header>
            {subheader && <p>{subheader}</p>}
            <div className={styles.buttonsContainer}>
              {profileImage !== "" && (
                <button onClick={removeFile ? (e) => removeFile(e) : undefined}>
                  {buttonTwoText}
                </button>
              )}
              <FileUploadWithButton
                addFile={handleProfileImageUpload}
                addFileButtonText="Upload New"
                randomColor={randomColor}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default AreYouSureInterface;
