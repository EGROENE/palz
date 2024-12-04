import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TUser, TThemeColor } from "../../../types";
import styles from "./styles.module.css";

const ListedUser = ({
  user,
  buttonOneHandler,
  buttonOneHandlerParams,
  buttonOneIsDisabled,
  buttonOneLink,
  buttonTwoHandler,
  buttonTwoHandlerParams,
  buttonOneText,
  buttonTwoText,
  buttonTwoIsDisabled,
  buttonTwoLink,
  objectLink, // link that entire component leads to
}: {
  user?: TUser;
  randomColor?: string;
  buttonOneHandler?: Function;
  buttonOneHandlerParams?: any[];
  buttonOneIsDisabled: boolean | null;
  buttonTwoHandler?: Function;
  buttonTwoHandlerParams?: any[];
  buttonOneText: string;
  buttonTwoText: string;
  buttonTwoIsDisabled: boolean | null;
  buttonOneLink: string | null;
  buttonTwoLink: string | null;
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
          <p>{`${user?.firstName} ${user?.lastName}`}</p>
          <p>{user?.username}</p>
        </div>
      )}
      {buttonOneLink !== null ? (
        <Link to={buttonOneLink}>
          <button
            disabled={buttonOneIsDisabled !== null && buttonOneIsDisabled}
            onClick={
              buttonOneHandler
                ? buttonOneHandlerParams && buttonOneHandlerParams.length > 0
                  ? // @ts-ignore
                    (e) => buttonOneHandler(e, ...buttonOneHandlerParams)
                  : () => buttonOneHandler()
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
        <button
          disabled={buttonOneIsDisabled !== null && buttonOneIsDisabled}
          onClick={
            buttonOneHandler
              ? buttonOneHandlerParams && buttonOneHandlerParams.length > 0
                ? // @ts-ignore
                  (e) => buttonOneHandler(e, ...buttonOneHandlerParams)
                : () => buttonOneHandler()
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
      )}
      {buttonTwoLink !== null ? (
        <Link to={buttonTwoLink}>
          <button
            disabled={buttonTwoIsDisabled !== null && buttonTwoIsDisabled}
            onClick={
              buttonTwoHandler
                ? buttonTwoHandlerParams && buttonTwoHandlerParams.length > 0
                  ? (e) => buttonTwoHandler(e, ...buttonTwoHandlerParams)
                  : buttonTwoHandler()
                : undefined
            }
            style={{ backgroundColor: "tomato" }}
          >
            {buttonTwoText}
          </button>
        </Link>
      ) : (
        <button
          disabled={buttonTwoIsDisabled !== null && buttonTwoIsDisabled}
          onClick={
            buttonTwoHandler
              ? buttonTwoHandlerParams && buttonTwoHandlerParams.length > 0
                ? (e) => buttonTwoHandler(e, ...buttonTwoHandlerParams)
                : buttonTwoHandler()
              : undefined
          }
          style={{ backgroundColor: "tomato" }}
        >
          {buttonTwoText}
        </button>
      )}
    </div>
  );
};
export default ListedUser;
