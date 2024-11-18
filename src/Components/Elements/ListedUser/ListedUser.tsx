import { TUser } from "../../../types";
import styles from "./styles.module.css";

const ListedUser = ({
  user,
  randomColor,
  buttonOneHandler,
  buttonOneHandlerParams,
  buttonOneIsDisabled,
  buttonTwoHandler,
  buttonTwoHandlerParams,
  buttonOneText,
  buttonTwoText,
  buttonTwoIsDisabled,
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
      <button
      disabled={buttonOneIsDisabled !== null && buttonOneIsDisabled}
        onClick={
          buttonOneHandler
            ? // @ts-ignore
              (e) => buttonOneHandler(e, ...buttonOneHandlerParams)
            : undefined
        }
        style={{ backgroundColor: randomColor }}
      >
        {buttonOneText}
      </button>
      <button
      disabled={buttonTwoIsDisabled !== null && buttonTwoIsDisabled}
        onClick={
          buttonTwoHandler
            ? (e) => buttonTwoHandler(e, ...buttonTwoHandlerParams)
            : undefined
        }
        style={{ backgroundColor: "tomato" }}
      >
        {buttonTwoText}
      </button>
    </div>
  );
};
export default ListedUser;
