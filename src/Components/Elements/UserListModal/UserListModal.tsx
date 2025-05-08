import { useUserContext } from "../../../Hooks/useUserContext";
import { TOtherUser, TUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useMainContext } from "../../../Hooks/useMainContext";
import QueryLoadingOrError from "../QueryLoadingOrError/QueryLoadingOrError";
import { useChatContext } from "../../../Hooks/useChatContext";
import Requests from "../../../requests";

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
    currentUser,
    blockedUsers,
    setBlockedUsers,
    fetchAllVisibleOtherUsersQuery,
    handleUnblockUser,
  } = useUserContext();

  const visibleOtherUsers = fetchAllVisibleOtherUsersQuery.data;

  const { currentEvent, fetchAllEventsQuery, handleDeleteUserRSVP, handleRemoveInvitee } =
    useEventContext();
  const { startConversation } = useChatContext();

  const getUserArray = (): TOtherUser[] => {
    const userArray: TOtherUser[] = [];
    if (userIDArray && visibleOtherUsers) {
      for (const userID of userIDArray) {
        const matchingUser = visibleOtherUsers.filter((user) => user._id === userID)[0];
        userArray.push(matchingUser);
      }
    }
    return userArray;
  };
  const userArray = getUserArray();

  const displayedUserCount = userArray.length;

  const getButtonOneHandlerParams = (user: TOtherUser) => {
    if (user._id) {
      Requests.getUserByID(user._id).then((res) => {
        if (res.ok) {
          res.json().then((userObject) => {
            if (!buttonOneHandlerParams) {
              if (
                listType === "blocked-users" &&
                buttonOneHandler === handleUnblockUser
              ) {
                return [currentUser, userObject, blockedUsers, setBlockedUsers];
              }
              if (
                (listType === "invitees" || listType === "rsvpd-users") &&
                buttonOneHandler === startConversation
              ) {
                return [userObject];
              }
            }
          });
        } else {
          getButtonOneHandlerParams(user);
        }
      });
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

  const getButtonOneLink = (user: TOtherUser): string | null => {
    if (listType === "other-user-friends" || listType === "mutual-friends") {
      return `/users/${user.username}`;
    }
    return null;
  };

  // When used for events, both fetchAllVisibleOtherUsersQuery & fetchAllEventsQuery will have to be successful for users to be displayed
  // If used for displaying users not related to an event, only fetchAllVisibleOtherUsersQuery will have to succeed for users to be shown
  const isNoFetchError: boolean =
    listType === "blocked-users" || listType === "other-user-friends"
      ? !fetchAllVisibleOtherUsersQuery.isError
      : !fetchAllEventsQuery.isError && !fetchAllVisibleOtherUsersQuery.isError;

  const fetchIsLoading: boolean =
    listType === "blocked-users" || listType === "other-user-friends"
      ? fetchAllVisibleOtherUsersQuery.isLoading
      : fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (listType !== "blocked-users" && listType !== "other-user-friends") {
      if (fetchAllVisibleOtherUsersQuery.isError) {
        return fetchAllVisibleOtherUsersQuery;
      }
      return fetchAllEventsQuery;
    }
    return fetchAllVisibleOtherUsersQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

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
            userArray.map((user) => (
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
