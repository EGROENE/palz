import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import styles from "./styles.module.css";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  closeModalMethod,
  header,
  handleDeletion,
  userIDArray,
  deleteFrom,
  randomColor,
  buttonTwoText
}: {
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  handleDeletion: Function;
  userIDArray: (string | undefined)[] | undefined;
  deleteFrom: "event-list" | "blocked-users";
  randomColor?: string;
  buttonTwoText?: string;
}) => {
  const { allUsers, currentUser } = useUserContext();
  const { currentEvent } = useEventContext();

  const userArray: TUser[] = [];
  if (userIDArray) {
    for (const userID of userIDArray) {
      const matchingUser = allUsers.filter((user) => user._id === userID)[0];
      userArray.push(matchingUser);
    }
  }

  return (
    <div className={styles.modalBackground}>
      <i
        title="Close"
        onClick={() => closeModalMethod(false)}
        className="fas fa-times close-module-icon"
      ></i>
      <div
        style={{ border: `2px solid ${randomColor}` }}
        className={styles.userListContainer}
      >
        <h2>{header}</h2>
        {userArray.map((user) => (
          <ListedUser
            key={user._id}
            randomColor={randomColor}
            user={user}
            buttonOneText="Message"
            buttonOneLink={null}
            buttonOneIsDisabled={null}
            buttonTwoText={buttonTwoText ? buttonTwoText :"Remove"}
            buttonTwoIsDisabled={null}
            buttonTwoHandler={handleDeletion}
            buttonTwoHandlerParams={deleteFrom === "blocked-users" ? [currentUser, user] : [currentEvent, user]}
            handlerTwoNeedsEventParam={deleteFrom === "blocked-users" ? false : true}
            buttonTwoLink={null}
            objectLink={`/users/${user?.username}`}
          />
        ))}
      </div>
    </div>
  );
};
export default UserListModal;
