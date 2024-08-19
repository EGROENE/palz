import { TUser } from "../../../types";

/* Returns a tab w/ user image, username, & 'X' button, which, onClick, remove user from something. At time of creation, this is used on AddEventForm to show which other users have been added as co-organizers and/or invitees. */
const UserTab = ({
  user,
  removeHandler,
  randomColor,
  isDisabled,
}: {
  user: TUser;
  removeHandler: (user: TUser) => void;
  randomColor?: string;
  isDisabled: boolean;
}) => {
  return (
    <div
      title={`${user.firstName} ${user.lastName}`}
      key={user.id}
      style={{ backgroundColor: randomColor }}
      className={isDisabled ? "tab user disabled" : "tab user"}
    >
      <img src={`${user.profileImage}`} alt="profile pic" />
      <span>{user.username}</span>
      <i
        onClick={() => (!isDisabled ? removeHandler(user) : undefined)}
        className="fas fa-times"
      ></i>
    </div>
  );
};
export default UserTab;
