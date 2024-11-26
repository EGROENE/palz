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
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
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
              <div className="button-container">
                <button
                  onClick={
                    buttonOneHandler
                      ? // @ts-ignore
                        (e) =>
                          buttonOneHandlerParams
                            ? buttonOneHandler(e, ...buttonOneHandlerParams)
                            : buttonOneHandler()
                      : undefined
                  }
                >
                  {buttonOneText}
                </button>
              </div>
              <div className="button-container">
                <button
                  style={{ backgroundColor: randomColor }}
                  onClick={
                    buttonTwoHandler
                      ? (e) =>
                          buttonTwoHandlerParams
                            ? buttonTwoHandler(e, ...buttonTwoHandlerParams)
                            : buttonTwoHandler()
                      : undefined
                  }
                >
                  {buttonTwoText}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <header style={{ color: randomColor }}>{header}</header>
            {subheader && <p>{subheader}</p>}
            <div className={styles.buttonsContainer}>
              {profileImage !== "" && (
                <div className="button-container">
                  <button
                    onClick={
                      buttonTwoHandler
                        ? (e) =>
                            buttonTwoHandlerParams
                              ? buttonTwoHandler(e, ...buttonTwoHandlerParams)
                              : buttonTwoHandler()
                        : undefined
                    }
                  >
                    {buttonTwoText}
                  </button>
                </div>
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
