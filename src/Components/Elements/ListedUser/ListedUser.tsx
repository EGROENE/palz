import { Link } from "react-router-dom";
import { TUser } from "../../../types";
import styles from "./styles.module.css";

const ListedUser = ({
  user,
  randomColor,
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
  objectLink,
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
  return (
    <div key={user?._id} className={styles.listedUser}>
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
          <div className="button-container">
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
              style={{ backgroundColor: randomColor }}
            >
              {buttonOneText}
            </button>
          </div>
        </Link>
      ) : (
        <div className="button-container">
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
            style={{ backgroundColor: randomColor }}
          >
            {buttonOneText}
          </button>
        </div>
      )}
      {buttonTwoLink !== null ? (
        <Link to={buttonTwoLink}>
          <div className="button-container">
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
          </div>
        </Link>
      ) : (
        <div className="button-container">
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
        </div>
      )}
    </div>
  );
};
export default ListedUser;
