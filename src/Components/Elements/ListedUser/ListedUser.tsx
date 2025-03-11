import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TUser, TThemeColor } from "../../../types";
import styles from "./styles.module.css";

const ListedUser = ({
  renderButtonOne,
  renderButtonTwo,
  user,
  title,
  buttonOneText,
  buttonOneHandler,
  buttonOneIsDisabled,
  buttonOneLink,
  buttonOneHandlerNeedsEventParam,
  buttonOneHandlerParams,
  buttonTwoText,
  buttonTwoHandler,
  buttonTwoIsDisabled,
  buttonTwoLink,
  buttonTwoHandlerNeedsEventParam,
  buttonTwoHandlerParams,
  objectLink, // link that entire component leads to
}: {
  renderButtonOne: boolean;
  renderButtonTwo: boolean;
  user?: TUser;
  title?: string;
  buttonOneText?: string;
  buttonOneHandler?: Function;
  buttonOneIsDisabled?: boolean | null;
  buttonOneLink?: string | null;
  buttonOneHandlerNeedsEventParam?: boolean;
  buttonOneHandlerParams?: any[];
  buttonTwoText?: string;
  buttonTwoHandler?: Function;
  buttonTwoIsDisabled?: boolean | null;
  buttonTwoLink?: string | null;
  buttonTwoHandlerNeedsEventParam?: boolean;
  buttonTwoHandlerParams?: any[];
  objectLink?: string | undefined;
}) => {
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    // Set color of event card's border randomly:
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
    <div
      key={user?._id}
      className={styles.listedUser}
      style={{ borderColor: randomColor }}
    >
      <img
        style={{ border: `2px solid ${randomColor}` }}
        src={`${user?.profileImage}`}
        alt="profile pic"
      />
      {objectLink ? (
        <Link to={objectLink}>
          <div className={styles.listedUserTextsContainer}>
            <p>{`${user?.firstName} ${user?.lastName}`}</p>
            <p>{user?.username}</p>
          </div>
        </Link>
      ) : (
        <div className={styles.listedUserTextsContainer}>
          {title && (
            <p className={styles.userTitle} style={{ color: randomColor }}>
              {title}
            </p>
          )}
          <p>{`${user?.firstName} ${user?.lastName}`}</p>
          <p>{user?.username}</p>
        </div>
      )}
      {renderButtonOne && buttonOneLink ? (
        <Link to={buttonOneLink}>
          <button
            disabled={buttonOneIsDisabled !== null && buttonOneIsDisabled}
            onClick={
              buttonOneHandler
                ? buttonOneHandlerNeedsEventParam
                  ? (e) =>
                      buttonOneHandlerParams
                        ? buttonOneHandler(e, ...buttonOneHandlerParams)
                        : buttonOneHandler(e)
                  : () =>
                      buttonOneHandlerParams
                        ? buttonOneHandler(...buttonOneHandlerParams)
                        : buttonOneHandler()
                : undefined
            }
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
          >
            {buttonOneText}
          </button>
        </Link>
      ) : (
        renderButtonOne && (
          <button
            disabled={buttonOneIsDisabled !== null && buttonOneIsDisabled}
            onClick={
              buttonOneHandler
                ? buttonOneHandlerNeedsEventParam
                  ? (e) =>
                      buttonOneHandlerParams
                        ? buttonOneHandler(e, ...buttonOneHandlerParams)
                        : buttonOneHandler(e)
                  : () =>
                      buttonOneHandlerParams
                        ? buttonOneHandler(...buttonOneHandlerParams)
                        : buttonOneHandler()
                : undefined
            }
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
          >
            {buttonOneText}
          </button>
        )
      )}
      {renderButtonTwo && buttonTwoLink ? (
        <Link to={buttonTwoLink}>
          <button
            disabled={buttonTwoIsDisabled !== null && buttonTwoIsDisabled}
            onClick={
              buttonTwoHandler
                ? buttonTwoHandlerNeedsEventParam
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
            style={{ backgroundColor: "tomato" }}
          >
            {buttonTwoText}
          </button>
        </Link>
      ) : (
        renderButtonTwo && (
          <button
            disabled={buttonTwoIsDisabled !== null && buttonTwoIsDisabled}
            onClick={
              buttonTwoHandler
                ? buttonTwoHandlerNeedsEventParam
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
            style={{ backgroundColor: "tomato" }}
          >
            {buttonTwoText}
          </button>
        )
      )}
    </div>
  );
};
export default ListedUser;
