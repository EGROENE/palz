import { useState } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import styles from "./styles.module.css";
import { useMainContext } from "../../../Hooks/useMainContext";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  renderButtonOne,
  closeModalMethod,
  header,
  handleDeletion,
  userIDArray,
  deleteFrom,
  randomColor,
  buttonTwoText
}: {
  renderButtonOne: boolean;
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  handleDeletion: Function;
  userIDArray: (string | undefined)[] | undefined;
  deleteFrom: "invitee-list" | "rsvp-list" | "blocked-users";
  randomColor?: string;
  buttonTwoText?: string;
}) => {
  const {isLoading} = useMainContext()
  const { allUsers, currentUser } = useUserContext();
  const { currentEvent } = useEventContext();

  const getUserArray = ():TUser[] => {
    const userArray: TUser[] = [];
    if (userIDArray) {
      for (const userID of userIDArray) {
        const matchingUser = allUsers.filter((user) => user._id === userID)[0];
        userArray.push(matchingUser);
      }
    }
    return userArray;
  }
  const [userArray, setUserArray] = useState<TUser[]>(getUserArray());

  const getButtonTwoHandlerParams = (user: TUser ) => {
    if (deleteFrom === "blocked-users") {
      return [currentUser, user, undefined, userArray, setUserArray];
    }

    if (deleteFrom === "invitee-list") {
      return [currentEvent, user, userArray, setUserArray];

    }
    // if deleteFrom === "rsvp-list"
    return [currentEvent, user, undefined, userArray, setUserArray]
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
            renderButtonOne={renderButtonOne}
            randomColor={randomColor}
            user={user}
            buttonOneText="Message"
            buttonOneLink={null}
            buttonOneIsDisabled={isLoading}
            buttonTwoText={buttonTwoText ? buttonTwoText :"Remove"}
            buttonTwoIsDisabled={isLoading}
            buttonTwoHandler={handleDeletion}
            buttonTwoHandlerParams={getButtonTwoHandlerParams(user)}
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
