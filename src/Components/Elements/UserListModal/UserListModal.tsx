import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import styles from "./styles.module.css";
import { useMainContext } from "../../../Hooks/useMainContext";
import QueryLoadingOrError from "../QueryLoadingOrError/QueryLoadingOrError";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  listType,
  renderButtonOne,
  closeModalMethod,
  header,
  userIDArray,
  buttonOneText,
  buttonOneHandler,
  buttonOneHandlerNeedsEventParam,
  buttonOneHandlerParams,
  buttonTwoText,
  buttonTwoHandler,
  buttonTwoHandlerNeedsEventParam,
  buttonTwoHandlerParams,
  buttonTwoLink,
  deleteFrom,
  randomColor,
}: {
  listType: "invitees" | "rsvpd-users" | "other-user-friends" | "blocked-users";
  renderButtonOne: boolean;
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  userIDArray: (string | undefined)[] | undefined | null;
  buttonOneText?: string;
  buttonOneHandler?: Function;
  buttonOneHandlerNeedsEventParam?: boolean;
  buttonOneHandlerParams?: any[];
  buttonTwoText?: string;
  buttonTwoHandler?: Function;
  buttonTwoHandlerNeedsEventParam?: boolean;
  buttonTwoHandlerParams?: any[];
  buttonTwoLink?: string;
  deleteFrom?: "invitee-list" | "rsvp-list" | "blocked-users";
  randomColor?: string;
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

  const getNumberOfUsersWhoHaveBlockRelationshipWithCurrentUser = (): number => {
    let sum = 0;
    for (const user of userArray) {
      if (user && user._id && currentUser && currentUser._id) {
        if (
          user.blockedUsers.includes(currentUser._id) ||
          currentUser?.blockedUsers.includes(user._id)
        ) {
          sum++;
        }
      }
    }
    return sum;
  };
  const numberOfUsersWhoHaveBlockRelationshipWithCurrentUser =
    getNumberOfUsersWhoHaveBlockRelationshipWithCurrentUser();

  const getButtonTwoHandlerParams = (user: TUser) => {
    if (listType === "blocked-users") {
      return [currentUser, user, blockedUsers, setBlockedUsers];
    }

    if (listType === "invitees" || listType === "rsvpd-users") {
      return [currentEvent, user];
    }
  };

  const getButtonTwoLink = (user: TUser): string | null => {
    if (listType === "other-user-friends") {
      return `/users/${user.username}`;
    }
    return null;
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
          (userArray.length - numberOfUsersWhoHaveBlockRelationshipWithCurrentUser > 0 ? (
            userArray.map(
              (user) =>
                currentUser &&
                currentUser._id &&
                user._id &&
                !user.blockedUsers.includes(currentUser._id) &&
                !currentUser?.blockedUsers.includes(user._id) && (
                  <ListedUser
                    key={user._id}
                    renderButtonOne={renderButtonOne}
                    user={user}
                    buttonOneText={buttonOneText}
                    buttonOneHandler={buttonOneHandler}
                    buttonOneHandlerNeedsEventParam={buttonOneHandlerNeedsEventParam}
                    buttonOneHandlerParams={buttonOneHandlerParams}
                    buttonOneLink={null}
                    buttonOneIsDisabled={isLoading}
                    buttonTwoText={buttonTwoText}
                    buttonTwoIsDisabled={isLoading}
                    buttonTwoHandler={buttonTwoHandler}
                    buttonTwoHandlerNeedsEventParam={buttonTwoHandlerNeedsEventParam}
                    buttonTwoHandlerParams={
                      buttonTwoHandlerParams
                        ? buttonTwoHandlerParams
                        : getButtonTwoHandlerParams(user)
                    }
                    buttonTwoLink={buttonTwoLink ? buttonTwoLink : getButtonTwoLink(user)}
                    objectLink={`/users/${user?.username}`}
                  />
                )
            )
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
