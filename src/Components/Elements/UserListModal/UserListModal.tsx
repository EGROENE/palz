import { TUser, TEvent } from "../../../types";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  closeModalMethod,
  header,
  handleUserRemoval,
  userArray,
  event,
  randomColor,
}: {
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  handleUserRemoval: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,

    event: TEvent,
    user: TUser
  ) => void;
  userArray: TUser[];
  event: TEvent;
  randomColor?: string;
}) => {
  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={() => closeModalMethod(false)}
        className="fas fa-times close-module-icon"
      ></i>
      <div className="user-list-container">
        <h2>{header}</h2>
        {userArray.map((user) => (
          <div key={user.id} className="listed-user">
            <img
              style={{ border: `2px solid ${randomColor}` }}
              src={`${user.profileImage}`}
              alt="profile pic"
            />
            <div className="listed-user-texts-container">
              <p>{`${user.firstName} ${user.lastName}`}</p>
              <p>{user.username}</p>
            </div>
            <button style={{ backgroundColor: randomColor }}>Message</button>
            <button
              onClick={(e) => handleUserRemoval(e, event, user)}
              style={{ backgroundColor: "tomato" }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default UserListModal;
