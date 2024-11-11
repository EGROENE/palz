import { TUser, TEvent } from "../../../types";
import styles from "./styles.module.css";

const ListedUser = ({
  user,
  event,
  randomColor,
  buttonOneHandler,
  buttonTwoHandler,
  buttonOneText,
  buttonTwoText,
}: {
  user?: TUser;
  event?: TEvent;
  randomColor?: string;
  buttonOneHandler?: Function;
  buttonTwoHandler?: Function;
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
        onClick={buttonOneHandler ? (e) => buttonOneHandler(e) : undefined}
        style={{ backgroundColor: randomColor }}
      >
        {buttonOneText}
      </button>
      <button
        onClick={buttonTwoHandler ? (e) => buttonTwoHandler(e, event, user) : undefined}
        style={{ backgroundColor: "tomato" }}
      >
        {buttonTwoText}
      </button>
    </div>
  );
};
export default ListedUser;
