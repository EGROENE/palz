import { useEffect, useState } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser, TBarebonesUser } from "../../../types";
import ListedUser from "../ListedUser/ListedUser";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useChatContext } from "../../../Hooks/useChatContext";
import Requests from "../../../requests";
import Methods from "../../../methods";

/* Component contains a modal w/ background, as well as a list of users. In every user box, there is user image, name, username, & button that will eventually make it possible to message user & a button that removes user from list. To be used on event pages to show list of RSVPs & list of invitees. */
const UserListModal = ({
  listType,
  renderButtonOne,
  renderButtonTwo,
  closeModalMethod,
  header,
  users,
  fetchUsers,
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
  users: (string | TBarebonesUser)[];
  fetchUsers: boolean;
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

  const { currentEvent, fetchAllEventsQuery, handleDeleteUserRSVP, handleRemoveInvitee } =
    useEventContext();
  const { getStartOrOpenChatWithUserHandler } = useChatContext();

  const [iterableUsers, setIterableUsers] = useState<TBarebonesUser[] | null>(null);

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);

  useEffect(() => {
    if (fetchUsers) {
      setFetchIsLoading(true);
      const getPromisesForFullUserObjects = (): Promise<TUser>[] => {
        const promisesToAwait = users.map((id) => {
          if (typeof id === "string") {
            return Requests.getUserByID(id).then((res) => {
              return res.json().then((user: TUser) => user);
            });
          }
        });
        return promisesToAwait.filter((elem) => elem !== undefined);
      };

      Promise.all(getPromisesForFullUserObjects())
        .then((users: TUser[]) =>
          setIterableUsers(
            users
              .map((u) => {
                if (
                  currentUser &&
                  currentUser._id &&
                  u._id &&
                  !currentUser.blockedUsers.includes(u._id.toString()) &&
                  !u.blockedUsers.includes(currentUser._id.toString())
                ) {
                  return Methods.getTBarebonesUser(u);
                }
              })
              .filter((elem) => elem !== undefined)
          )
        )
        .catch((error) => {
          console.log(error);
          setIsFetchError(true);
        })
        .finally(() => setFetchIsLoading(false));
    } else {
      if (users.every((u) => Methods.isTBarebonesUser(u))) {
        setIterableUsers(users);
      }
    }
  }, [listType]);

  const getButtonOneHandlerParams = (user: TBarebonesUser) => {
    if (!buttonOneHandlerParams) {
      if (listType === "blocked-users" && buttonOneHandler === handleUnblockUser) {
        return [currentUser, user, blockedUsers, setBlockedUsers];
      } else if (
        (listType === "invitees" || listType === "rsvpd-users") &&
        buttonOneHandler === getStartOrOpenChatWithUserHandler
      ) {
        return [user];
      }
    }
  };

  const getButtonTwoHandlerParams = (user: TBarebonesUser) => {
    if (user._id) {
      Requests.getUserByID(user._id.toString())
        .then((res) => {
          if (res.ok) {
            res
              .json()
              .then((user: TUser) => {
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
              })
              .catch((error) => console.log(error));
          } else {
            getButtonTwoHandlerParams(user);
          }
        })
        .catch((error) => console.log(error));
    }
    return undefined;
  };

  const getButtonOneLink = (user: TBarebonesUser): string | null => {
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

  const fetchIsLoading2: boolean =
    listType === "blocked-users" || listType === "other-user-friends"
      ? fetchIsLoading
      : fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (listType !== "blocked-users" && listType !== "other-user-friends") {
      if (fetchAllVisibleOtherUsersQuery.isError) {
        return fetchAllVisibleOtherUsersQuery;
      } else if (fetchAllEventsQuery.isError) {
        return fetchAllEventsQuery;
      }
    } else if (listType === "blocked-users" || listType === "other-user-friends") {
      if (fetchAllVisibleOtherUsersQuery.isError) {
        return fetchAllVisibleOtherUsersQuery;
      }
    }
    return undefined;
  };
  const queryWithError = getQueryForQueryLoadingOrErrorComponent();

  // As long as iterableUsers is null, display loading
  // If error in setting iterableUsers, show error message
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
        <h2>
          {`${header}`}
          {iterableUsers !== null && iterableUsers.length > 0 && (
            <span>{` (${iterableUsers.length})`}</span>
          )}
        </h2>
        {isNoFetchError &&
          !fetchIsLoading2 &&
          iterableUsers !== null &&
          (iterableUsers.length > 0 ? (
            iterableUsers.map((user) => (
              <ListedUser
                key={user._id?.toString()}
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
        {fetchIsLoading && (
          <header style={{ marginTop: "3rem" }} className="query-status-text">
            Loading...
          </header>
        )}
        {queryWithError && queryWithError.error && (
          <div className="query-error-container">
            <header className="query-status-text">Error fetching data.</header>
            <div className="theme-element-container">
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserListModal;
