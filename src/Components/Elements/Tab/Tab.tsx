import { TUser } from "../../../types";
import styles from "./styles.module.css";

/* Returns a tab w/ user image, username, & 'X' button, which, onClick, remove user from something. At time of creation, this is used on AddEventForm to show which other users have been added as co-organizers and/or invitees. */
const Tab = ({
  info,
  addHandler,
  removeHandler,
  randomColor,
  isDisabled,
  userMayNotDelete,
  specialIcon,
}: {
  info: TUser | string;
  addHandler?: any;
  removeHandler?: any;
  randomColor?: string;
  isDisabled?: boolean;
  userMayNotDelete?: boolean;
  specialIcon?: JSX.Element;
}) => {
  const onClickFunction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (addHandler) {
      return addHandler(info, e); // if calling handleAddInterest(interest: string, e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
    } else {
      if (typeof info !== "string") {
        return removeHandler(undefined, info); // if calling handleRemoveUserAsOrganizer/Invitee: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>, user?: TUser) => void
      }
      return removeHandler(info, e); // if calling handleRemoveInterest: (interest: string, e?: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
    }
  };

  return (
    <div
      title={typeof info !== "string" ? `${info.firstName} ${info.lastName}` : undefined}
      key={typeof info === "string" ? info : info._id}
      style={
        randomColor === "var(--primary-color)"
          ? { backgroundColor: `${randomColor}`, color: "black" }
          : { backgroundColor: `${randomColor}`, color: "white" }
      }
      className={isDisabled ? `${styles.tab} disabled` : `${styles.tab}`}
    >
      {typeof info !== "string" && (
        <img src={`${info.profileImage}`} alt={`${info.username} profile pic`} />
      )}
      <span>
        {typeof info !== "string" ? info.username : info}
        {specialIcon && specialIcon}
      </span>
      {!userMayNotDelete && (
        <i
          style={addHandler && { "rotate": "45deg" }} // turns X into plus sign
          onClick={(e) => onClickFunction(e)}
          className="fas fa-times"
          title={addHandler ? "Add" : "Remove"}
        ></i>
      )}
    </div>
  );
};
export default Tab;
