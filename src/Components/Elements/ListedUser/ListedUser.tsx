import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TUser, TThemeColor } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

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
    <div key={user?._id} className="listedUser" style={{ borderColor: randomColor }}>
      <img
        style={{ border: `2px solid ${randomColor}` }}
        src={
          user && user.profileImage !== "" ? `${user.profileImage}` : defaultProfileImage
        }
        alt="profile pic"
      />
      <div className={styles.infoContainer}>
        {objectLink ? (
          <Link to={objectLink} target="_blank">
            <div className={styles.listedUserTextsContainer}>
              {title && <p className={styles.userTitle}>{title}</p>}
              <p
                className={styles.listedUserName}
                style={{ color: randomColor }}
              >{`${user?.firstName} ${user?.lastName}`}</p>
              <p className={styles.listedUserUsername}>{user?.username}</p>
            </div>
          </Link>
        ) : (
          <div className={styles.listedUserTextsContainer}>
            {title && (
              <p className={styles.userTitle} style={{ color: randomColor }}>
                {title}
              </p>
            )}
            <p
              className={styles.listedUserName}
            >{`${user?.firstName} ${user?.lastName}`}</p>
            <p className={styles.listedUserUsername}>{user?.username}</p>
          </div>
        )}
        <div className={styles.listedUserBtnsContainer}>
          {renderButtonOne && buttonOneLink ? (
            <Link to={buttonOneLink}>
              <button
                disabled={buttonOneIsDisabled !== null && buttonOneIsDisabled}
                onClick={
                  buttonOneHandler
                    ? buttonOneHandlerNeedsEventParam
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
                            ? buttonOneHandler(...buttonOneHandlerParams, e)
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
                            ? buttonTwoHandler(...buttonTwoHandlerParams, e)
                            : buttonTwoHandler(e)
                      : () =>
                          buttonTwoHandlerParams
                            ? buttonTwoHandler(...buttonTwoHandlerParams)
                            : buttonTwoHandler()
                    : undefined
                }
                style={{ backgroundColor: "tomato", color: "white" }}
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
                            ? buttonTwoHandler(...buttonTwoHandlerParams, e)
                            : buttonTwoHandler(e)
                      : () =>
                          buttonTwoHandlerParams
                            ? buttonTwoHandler(...buttonTwoHandlerParams)
                            : buttonTwoHandler()
                    : undefined
                }
                style={{ backgroundColor: "tomato", color: "white" }}
              >
                {buttonTwoText}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default ListedUser;
