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
}) => {
  return (
    <div key={user?._id} className={styles.listedUser}>
      <img
        style={{ border: `2px solid ${randomColor}` }}
        src={`${user?.profileImage}`}
        alt="profile pic"
      />
      <div className={styles.listedUserTextsContainer}>
        <p>{`${user?.firstName} ${user?.lastName}`}</p>
        <p>{user?.username}</p>
      </div>
      {buttonOneLink !== null ? (
        <Link target="_blank" to={buttonOneLink}>
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
          style={{ backgroundColor: randomColor }}
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
