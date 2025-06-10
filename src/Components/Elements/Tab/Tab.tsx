import { TBarebonesUser, TOtherUser } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

/* Returns a tab w/ user image, username, & 'X' button, which, onClick, remove user from something. At time of creation, this is used on AddEventForm to show which other users have been added as co-organizers and/or invitees. */
const Tab = ({
  info,
  addHandler,
  addHandlerParams,
  addHandlerNeedsEventParam,
  removeHandler,
  removeHandlerParams,
  removeHandlerNeedsEventParam,
  randomColor,
  isDisabled,
  userMayNotDelete,
  specialIcon,
}: {
  info: TOtherUser | TEventInviteeOrOrganizer | string;
  addHandler?: Function;
  addHandlerParams?: any[];
  addHandlerNeedsEventParam?: boolean;
  removeHandler?: Function;
  removeHandlerParams?: any[];
  removeHandlerNeedsEventParam?: boolean;
  randomColor?: string;
  isDisabled?: boolean;
  userMayNotDelete?: boolean;
  specialIcon?: JSX.Element;
}) => {
  const getOnClickFunction = (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>
  ) => {
    if (addHandler && addHandlerParams) {
      if (addHandlerNeedsEventParam) {
        return addHandler(...addHandlerParams, e);
      } else {
        return addHandler(...addHandlerParams);
      }
    }
    if (removeHandler && removeHandlerParams) {
      if (removeHandlerParams) {
        if (removeHandlerNeedsEventParam && removeHandlerParams) {
          return removeHandler(...removeHandlerParams, e);
        } else {
          return removeHandler(...removeHandlerParams);
        }
      }
    }
  };

  return (
    <div
      tabIndex={0}
      aria-hidden="false"
      title={typeof info !== "string" ? `${info.firstName} ${info.lastName}` : undefined}
      key={typeof info === "string" ? info : info._id?.toString()}
      style={
        randomColor === "var(--primary-color)"
          ? { backgroundColor: `${randomColor}`, color: "black" }
          : { backgroundColor: `${randomColor}`, color: "white" }
      }
      className={isDisabled ? `${styles.tab} disabled` : `${styles.tab}`}
    >
      {typeof info !== "string" && (
        <img
          src={info.profileImage !== "" ? `${info.profileImage}` : defaultProfileImage}
        />
      )}
      <span>
        {typeof info !== "string" ? info.username : info}
        {specialIcon && specialIcon}
      </span>
      {!userMayNotDelete && (
        <i
          tabIndex={0}
          aria-hidden="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getOnClickFunction(e);
            }
          }}
          style={addHandler && { "rotate": "45deg" }} // turns X into plus sign
          onClick={(e) => getOnClickFunction(e)}
          className="fas fa-times"
          title={addHandler ? "Add" : "Remove"}
        ></i>
      )}
    </div>
  );
};
export default Tab;
