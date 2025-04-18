import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useMainContext } from "../../../Hooks/useMainContext";
import QueryLoadingOrError from "../QueryLoadingOrError/QueryLoadingOrError";
import { useChatContext } from "../../../Hooks/useChatContext";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  listType,
  renderButtonOne,
  renderButtonTwo,
  closeModalMethod,
  header,
  userIDArray,
  buttonOneText,
  buttonOneHandler,
  buttonOneHandlerNeedsEventParam,
  buttonOneHandlerParams,
  buttonOneLink,
  buttonTwoText,
  buttonTwoHandler,
  buttonTwoHandlerNeedsEventParam,
  buttonTwoHandlerParams,
  buttonTwoLink,
  randomColor,
}: {
  listType:
    | "invitees"
    | "rsvpd-users"
    | "other-user-friends"
    | "blocked-users"
    | "blocked-users-event"
    | "mutual-friends";
  renderButtonOne: boolean;
  renderButtonTwo: boolean;
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  userIDArray: (string | undefined)[] | undefined | null;
  buttonOneText?: string;
  buttonOneHandler?: Function;
  buttonOneHandlerNeedsEventParam?: boolean;
  buttonOneHandlerParams?: any[];
  buttonOneLink?: string;
  buttonTwoText?: string;
  buttonTwoHandler?: Function;
  buttonTwoHandlerNeedsEventParam?: boolean;
  buttonTwoHandlerParams?: any[];
  buttonTwoLink?: string;
  randomColor?: string;
}) => {
  const { isLoading } = useMainContext();
  const {
    allUsers,
    currentUser,
    blockedUsers,
    setBlockedUsers,
    fetchAllUsersQuery,
    handleUnblockUser,
  } = useUserContext();
  const { currentEvent, fetchAllEventsQuery, handleDeleteUserRSVP, handleRemoveInvitee } =
    useEventContext();
  const { startConversation } = useChatContext();

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

  const getNumberOfUsersInvisibleToCurrentUser = (): number => {
    let sum = 0;
    if (listType !== "blocked-users") {
      for (const user of userArray) {
        if (user && user._id && currentUser && currentUser._id) {
          if (
            user.blockedUsers.includes(currentUser._id) ||
            currentUser?.blockedUsers.includes(user._id) ||
            user._id === currentUser._id
          ) {
            sum++;
          }
        }
      }
    }
    return sum;
  };
  const numberOfUsersInvisibleToCurrentUser = getNumberOfUsersInvisibleToCurrentUser();

  const displayedUserCount = userArray.length - numberOfUsersInvisibleToCurrentUser;

  const getButtonOneHandlerParams = (user: TUser) => {
    if (!buttonOneHandlerParams) {
      if (listType === "blocked-users" && buttonOneHandler === handleUnblockUser) {
        return [currentUser, user, blockedUsers, setBlockedUsers];
      }
      if (
        (listType === "invitees" || listType === "rsvpd-users") &&
        buttonOneHandler === startConversation
      ) {
        return [user];
      }
    }
    return undefined;
  };

  const getButtonTwoHandlerParams = (user: TUser) => {
    if (!buttonTwoHandlerParams) {
      if (
        listType === "rsvpd-users" ||
        (listType === "invitees" &&
          (buttonTwoHandler === handleRemoveInvitee ||
            buttonTwoHandler === handleDeleteUserRSVP))
      ) {
        return [currentEvent, user];
      }
    }
    return undefined;
  };

  const getButtonOneLink = (user: TUser): string | null => {
    if (listType === "other-user-friends" || listType === "mutual-friends") {
      return `/users/${user.username}`;
    }
    return null;
  };

  // When used for events, both fetchAllUsersQuery & fetchAllEventsQuery will have to be successful for users to be displayed
  // If used for displaying users not related to an event, only fetchAllUsersQuery will have to succeed for users to be shown
  const isNoFetchError: boolean =
    listType === "blocked-users" || listType === "other-user-friends"
      ? !fetchAllUsersQuery.isError
      : !fetchAllEventsQuery.isError && !fetchAllUsersQuery.isError;

  const fetchIsLoading: boolean =
    listType === "blocked-users" || listType === "other-user-friends"
      ? fetchAllUsersQuery.isLoading
      : fetchAllEventsQuery.isLoading || fetchAllUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (listType !== "blocked-users" && listType !== "other-user-friends") {
      if (fetchAllUsersQuery.isError) {
        return fetchAllUsersQuery;
      }
      return fetchAllEventsQuery;
    }
    return fetchAllUsersQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  const getListedUserIsVisible = (user: TUser): boolean => {
    if (listType !== "blocked-users") {
      if (user && user._id && currentUser && currentUser._id) {
        if (
          user.blockedUsers.includes(currentUser._id) ||
          currentUser?.blockedUsers.includes(user._id)
        ) {
          return false;
        }
      }
    }

    if (user._id === currentUser?._id) {
      return false;
    }
    return true;
  };

  return (
    <div tabIndex={0} aria-hidden="false" className="modal-background">
      <i
        tabIndex={0}
        aria-hidden="false"
        title="Close"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            closeModalMethod(false);
          }
        }}
        onClick={() => closeModalMethod(false)}
        className="fas fa-times close-module-icon"
      ></i>
      <div style={{ border: `2px solid ${randomColor}` }} className="userListContainer">
        <h2>{`${header} (${displayedUserCount})`}</h2>
        {isNoFetchError &&
          !fetchIsLoading &&
          (displayedUserCount > 0 ? (
            userArray.map(
              (user) =>
                getListedUserIsVisible(user) && (
                  <ListedUser
                    key={user._id}
                    renderButtonOne={renderButtonOne}
                    renderButtonTwo={renderButtonTwo}
                    user={user}
                    buttonOneText={buttonOneText}
                    buttonOneHandler={buttonOneHandler}
                    buttonOneHandlerNeedsEventParam={buttonOneHandlerNeedsEventParam}
                    buttonOneHandlerParams={
                      buttonOneHandlerParams
                        ? buttonOneHandlerParams
                        : getButtonOneHandlerParams(user)
                    }
                    buttonOneLink={buttonOneLink ? buttonOneLink : getButtonOneLink(user)}
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
                    buttonTwoLink={buttonTwoLink ? buttonTwoLink : null}
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
