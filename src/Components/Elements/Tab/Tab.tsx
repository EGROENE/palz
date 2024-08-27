import { TUser } from "../../../types";

/* Returns a tab w/ user image, username, & 'X' button, which, onClick, remove user from something. At time of creation, this is used on AddEventForm to show which other users have been added as co-organizers and/or invitees. */
const Tab = ({
  info,
  addHandler,
  removeHandler,
  randomColor,
  isDisabled,
}: {
  info: TUser | string;
  addHandler?: any;
  removeHandler?: any;
  randomColor?: string;
  isDisabled?: boolean;
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
      key={typeof info === "string" ? info : info.id}
      style={{ backgroundColor: randomColor }}
      className={isDisabled ? "tab disabled" : "tab"}
    >
      {typeof info !== "string" && (
        <img src={`${info.profileImage}`} alt={`${info.username} profile pic`} />
      )}
      <span>{typeof info !== "string" ? info.username : info}</span>
      <i
        style={addHandler && { "rotate": "45deg" }} // turns X into plus sign
        onClick={(e) => onClickFunction(e)}
        className="fas fa-times"
        title={addHandler ? "Add" : "Remove"}
      ></i>
    </div>
  );
};
export default Tab;
