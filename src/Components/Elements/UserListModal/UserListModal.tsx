import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import styles from "./styles.module.css";
import { useMainContext } from "../../../Hooks/useMainContext";
import QueryLoadingOrError from "../QueryLoadingOrError/QueryLoadingOrError";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  renderButtonOne,
  closeModalMethod,
  header,
  handleDeletion,
  userIDArray,
  deleteFrom,
  randomColor,
  buttonTwoText,
}: {
  renderButtonOne: boolean;
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  handleDeletion: Function;
  userIDArray: (string | undefined)[] | undefined | null;
  deleteFrom: "invitee-list" | "rsvp-list" | "blocked-users";
  randomColor?: string;
  buttonTwoText?: string;
}) => {
  const { isLoading } = useMainContext();
  const { allUsers, currentUser, blockedUsers, setBlockedUsers, fetchAllUsersQuery } =
    useUserContext();
  const { currentEvent, fetchAllEventsQuery } = useEventContext();

  const getUserArray = (): TUser[] => {
    const userArray: TUser[] = [];
    if (userIDArray && allUsers) {
      for (const userID of userIDArray) {
        const matchingUser = allUsers.filter((user) => user._id === userID)[0];
        userArray.push(matchingUser);
      }
    }
    return userArray;
  };
  const userArray = getUserArray();

  const getButtonTwoHandlerParams = (user: TUser) => {
    if (deleteFrom === "blocked-users") {
      // params in handleUnblockUser()
      return [currentUser, user, blockedUsers, setBlockedUsers];
    }

    if (deleteFrom === "invitee-list") {
      // params in handleRemoveInvitee()
      return [currentEvent, user];
    }
    // if deleteFrom === "rsvp-list"
    // params in handleDeleteUserRSVP()
    return [currentEvent, user];
  };

  const usedFor = deleteFrom === "blocked-users" ? "user" : "event";

  // When used for events, both fetchAllUsersQuery & fetchAllEventsQuery will have to be successful for users to be displayed
  // If used for displaying users not related to an event, only fetchAllUsersQuery will have to succeed for users to be shown
  const isNoFetchError: boolean =
    usedFor === "user"
      ? !fetchAllUsersQuery.isError
      : !fetchAllEventsQuery.isError && !fetchAllUsersQuery.isError;

  const fetchIsLoading: boolean =
    usedFor === "user"
      ? fetchAllUsersQuery.isLoading
      : fetchAllEventsQuery.isLoading && fetchAllUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (usedFor !== "user") {
      if (fetchAllUsersQuery.isError) {
        return fetchAllUsersQuery;
      }
      return fetchAllEventsQuery;
    }
    return fetchAllUsersQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

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
        {isNoFetchError &&
          !fetchIsLoading &&
          (userArray.length > 0 ? (
            userArray.map((user) => (
              <ListedUser
                key={user._id}
                renderButtonOne={renderButtonOne}
                randomColor={randomColor}
                user={user}
                buttonOneText="Message"
                buttonOneLink={null}
                buttonOneIsDisabled={isLoading}
                buttonTwoText={buttonTwoText ? buttonTwoText : "Remove"}
                buttonTwoIsDisabled={isLoading}
                buttonTwoHandler={handleDeletion}
                buttonTwoHandlerParams={getButtonTwoHandlerParams(user)}
                handlerTwoNeedsEventParam={deleteFrom === "blocked-users" ? false : true}
                buttonTwoLink={null}
                objectLink={`/users/${user?.username}`}
              />
            ))
          ) : (
            <p>No users to show</p>
          ))}
        <QueryLoadingOrError
          query={queryForQueryLoadingOrError}
          errorMessage="Error fetching users"
        />
      </div>
    </div>
  );
};
export default UserListModal;
