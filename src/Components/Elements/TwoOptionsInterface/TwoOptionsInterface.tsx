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
  handlerOneNeedsEventParam?: boolean;
  buttonTwoHandler?: Function;
  buttonTwoHandlerParams?: any[];
  handlerTwoNeedsEventParam?: boolean;
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
  handlerOneNeedsEventParam,
  handlerTwoNeedsEventParam,
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
    <div tabIndex={0} className="modal-background">
      <i
        tabIndex={0}
        title="Close"
        onClick={() => closeHandler(false)}
        className="fas fa-times close-module-icon"
      ></i>
      <div tabIndex={0} className={styles.areYouSureModal}>
        {!isFileUpload ? (
          <>
            <header style={{ color: randomColor }}>{header}</header>
            {subheader && <p>{subheader}</p>}
            <div className={styles.buttonsContainer}>
              <button
                onClick={
                  buttonOneHandler
                    ? // @ts-ignore
                      handlerOneNeedsEventParam
                      ? (e) =>
                          buttonOneHandlerParams
                            ? buttonOneHandler(...buttonOneHandlerParams, e)
                            : buttonOneHandler(e)
                      : () =>
                          buttonOneHandlerParams
                            ? buttonOneHandler(...buttonOneHandlerParams)
                            : buttonOneHandler()
                    : undefined
                }
              >
                {buttonOneText}
              </button>
              <button
                style={
                  randomColor === "var(--primary-color)"
                    ? { backgroundColor: `${randomColor}`, color: "black" }
                    : { backgroundColor: `${randomColor}`, color: "white" }
                }
                onClick={
                  buttonTwoHandler
                    ? handlerTwoNeedsEventParam
                      ? (e) =>
                          buttonTwoHandlerParams
                            ? buttonTwoHandler(...buttonTwoHandlerParams, e)
                            : buttonTwoHandler(e)
                      : () =>
                          buttonTwoHandlerParams
                            ? buttonTwoHandler(...buttonTwoHandlerParams)
                            : buttonTwoHandler()
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
                      ? handlerTwoNeedsEventParam
                        ? (e) =>
                            buttonTwoHandlerParams
                              ? buttonTwoHandler(e, ...buttonTwoHandlerParams)
                              : buttonTwoHandler(e)
                        : () =>
                            buttonTwoHandlerParams
                              ? buttonTwoHandler(...buttonTwoHandlerParams)
                              : buttonTwoHandler()
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
