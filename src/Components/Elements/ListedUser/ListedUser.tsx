import { TUser } from "../../../types";
import styles from "./styles.module.css";

const ListedUser = ({
  user,
  randomColor,
  buttonOneHandler,
  buttonOneHandlerParams,
  buttonTwoHandler,
  buttonTwoHandlerParams,
  buttonOneText,
  buttonTwoText,
}: {
  user?: TUser;
  randomColor?: string;
  buttonOneHandler?: Function;
  buttonOneHandlerParams?: any[];
  buttonTwoHandler?: Function;
  buttonTwoHandlerParams?: any[];
  buttonOneText: string;
  buttonTwoText: string;
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
        onClick={
          buttonOneHandler
            ? (e) => buttonOneHandler(e, [...[buttonOneHandlerParams]])
            : undefined
        }
        style={{ backgroundColor: randomColor }}
      >
        {buttonOneText}
      </button>
      <button
        onClick={
          buttonTwoHandler
            ? (e) => buttonTwoHandler(e, [...[buttonTwoHandlerParams]])
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
