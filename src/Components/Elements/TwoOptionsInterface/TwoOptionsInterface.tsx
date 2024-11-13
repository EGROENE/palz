import { TThemeColor } from "../../../types";
import FileUploadWithButton from "../FileUploadWithButton/FileUploadWithButton";
import styles from "./styles.module.css";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useState, useEffect } from "react";

type TTwoOptionsInterfaceProps = {
  header: string;
  subheader?: string;
  buttonTwoText: string;
  buttonOneText: string;
  buttonOneHandler?: Function;
  buttonOneHandlerParams?: any[];
  buttonTwoHandler?: Function;
  buttonTwoHandlerParams?: any[];
  isFileUpload?: boolean;
  closeHandler: React.Dispatch<React.SetStateAction<boolean>>;
};

const TwoOptionsInterface = ({
  header,
  subheader,
  buttonTwoText,
  buttonOneText,
  buttonOneHandler,
  isFileUpload,
  buttonOneHandlerParams,
  buttonTwoHandler,
  buttonTwoHandlerParams,
  closeHandler,
}: TTwoOptionsInterfaceProps) => {
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
      <i
        title="Close"
        onClick={() => closeHandler(false)}
        className="fas fa-times close-module-icon"
      ></i>
      <div className={styles.areYouSureModal}>
        {!isFileUpload ? (
          <>
            <header style={{ color: randomColor }}>{header}</header>
            {subheader && <p>{subheader}</p>}
            <div className={styles.buttonsContainer}>
              <button
                onClick={
                  buttonOneHandler
                    ? // @ts-ignore
                      (e) => buttonOneHandler(e, ...buttonOneHandlerParams)
                    : undefined
                }
              >
                {buttonOneText}
              </button>
              <button
                style={{ backgroundColor: randomColor }}
                onClick={
                  buttonTwoHandler
                    ? (e) => buttonTwoHandler(e, ...buttonTwoHandlerParams)
                    : undefined
                }
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
                <button
                  onClick={
                    buttonTwoHandler
                      ? (e) => buttonTwoHandler(e, ...buttonTwoHandlerParams)
                      : undefined
                  }
                >
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
export default TwoOptionsInterface;
