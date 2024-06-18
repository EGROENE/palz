import { TUser } from "../../types";

/* Returns a tab w/ user image, username, & 'X' button, which, onClick, remove user from something. At time of creation, this is used on AddEventForm to show which other users have been added as co-organizers and/or invitees. */
const UserTab = ({
  user,
  removeHandler,
  randomColor,
}: {
  user: TUser;
  removeHandler: (user: TUser) => void;
  randomColor?: string;
}) => {
  return (
    <div
      title={`${user.firstName} ${user.lastName}`}
      key={user.id}
      style={{ backgroundColor: randomColor }}
      className="tab user"
    >
      <img src={`${user.profileImage}`} alt="profile pic" />
      <span>{user.username}</span>
      <i onClick={() => removeHandler(user)} className="fas fa-times"></i>
    </div>
  );
};
export default UserTab;
