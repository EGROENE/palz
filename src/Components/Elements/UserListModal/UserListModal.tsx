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
  outsideFetchIsError,
  outsideFetchIsLoading,
  displayCount,
}: {
  listType:
    | "invitees"
    | "rsvpd-users"
    | "other-user-friends"
    | "blocked-users"
    | "blocked-users-event"
    | "mutual-friends"
    | "declined-invitations"
    | "interest-users";
  renderButtonOne: boolean;
  renderButtonTwo: boolean;
  closeModalMethod: (value: React.SetStateAction<boolean>) => void;
  header: string;
  users?: TBarebonesUser[];
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
  outsideFetchIsError?: boolean;
  outsideFetchIsLoading?: boolean;
  displayCount?: boolean;
}) => {
  const {
    isLoading,
    setUserListFetchStart,
    userListFetchLimit,
    userListFetchStart,
    currentInterest,
    setUserListFetchLimit,
  } = useMainContext();
  const { currentUser, blockedUsers, handleUnblockUser, currentOtherUser } =
    useUserContext();

  const {
    currentEvent,
    handleRemoveInvitee,
    interestedUsersCurrentEvent,
    setInterestedUsersCurrentEvent,
    inviteesCurrentEvent,
    setInviteesCurrentEvent,
  } = useEventContext();
  const { getStartOrOpenChatWithUserHandler } = useChatContext();

  const [iterableUsers, setIterableUsers] = useState<TBarebonesUser[]>([]);

  const [initialFetchIsLoading, setInitialFetchIsLoading] = useState<boolean>(true);

  const [moreUsersLoading, setMoreUsersLoading] = useState<boolean>(false);

  const [fetchUsersIsError, setFetchUsersIsError] = useState<boolean>(false);

  // Call in onScroll of elem
  // Changes fetch start, which should trigger useEffect that calls .getInterestUsers w/ updated start & limit. In that useEffect,
  const handleLoadMoreItemsOnScroll = (
    items: TBarebonesUser[],
    e?: React.UIEvent<HTMLUListElement, UIEvent> | React.UIEvent<HTMLDivElement, UIEvent>
  ): void => {
    const eHTMLElement = e?.target as HTMLElement;
    const scrollTop = e ? eHTMLElement.scrollTop : null;
    const scrollHeight = e ? eHTMLElement.scrollHeight : null;
    const clientHeight = e ? eHTMLElement.clientHeight : null;

    const bottomReached =
      e && scrollTop && clientHeight
        ? scrollTop + clientHeight === scrollHeight
        : window.innerHeight + window.scrollY >= document.body.offsetHeight;

    if (bottomReached) {
      const lastItem: TBarebonesUser = items[items.length - 1];

      // Only increase start if lastItem.index + 1 isn't an index of an elem already in iterableUsers
      if (
        lastItem &&
        lastItem.index &&
        !iterableUsers
          .map((u) => u.index)
          .some((i) => {
            if (lastItem?.index) {
              return i === lastItem.index + 1;
            }
          })
      ) {
        setUserListFetchStart(lastItem.index + 1);
      }
    }
  };

  useEffect(() => {
    setUserListFetchStart(0);
    setUserListFetchLimit(10);
  }, []);

  // Set iterableUsers:
  useEffect(() => {
    if (currentUser?.username) {
      if (users) {
        setIterableUsers(users);
      }

      if (listType === "interest-users" && currentInterest) {
        setMoreUsersLoading(true);
        Requests.getInterestUsers(
          currentInterest,
          userListFetchStart,
          userListFetchLimit,
          currentUser.username
        )
          .then((res) => {
            if (res.ok) {
              res.json().then((batchOfInterestUsers: TUser[]) => {
                setIterableUsers(
                  iterableUsers.concat(
                    batchOfInterestUsers.map((u) => Methods.getTBarebonesUser(u))
                  )
                );
              });
            } else {
              setFetchUsersIsError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => {
            setMoreUsersLoading(false);
            if (initialFetchIsLoading) {
              setInitialFetchIsLoading(false);
            }
          });
      }

      if (listType === "invitees") {
        if (currentEvent?._id) {
          setMoreUsersLoading(true);
          Requests.getEventInvitees(
            currentEvent._id.toString(),
            userListFetchStart,
            userListFetchLimit
          )
            .then((res) => {
              if (res.ok) {
                res.json().then((invitees: TUser[]) => {
                  setIterableUsers(
                    iterableUsers.concat(
                      invitees.map((i) => Methods.getTBarebonesUser(i))
                    )
                  );
                });
              } else {
                setFetchUsersIsError(true);
              }
            })
            .catch((error) => console.log(error))
            .finally(() => {
              setMoreUsersLoading(false);
              if (initialFetchIsLoading) {
                setInitialFetchIsLoading(false);
              }
            });
        }
      }

      if (listType === "rsvpd-users") {
        if (currentEvent?._id) {
          setMoreUsersLoading(true);
          Requests.getEventRSVPs(
            currentEvent._id.toString(),
            userListFetchStart,
            userListFetchLimit
          )
            .then((res) => {
              if (res.ok) {
                res.json().then((rsvps: TUser[]) => {
                  setIterableUsers(
                    iterableUsers.concat(rsvps.map((r) => Methods.getTBarebonesUser(r)))
                  );
                });
              } else {
                setFetchUsersIsError(true);
              }
            })
            .catch((error) => console.log(error))
            .finally(() => {
              setMoreUsersLoading(false);
              if (initialFetchIsLoading) {
                setInitialFetchIsLoading(false);
              }
            });
        }
      }

      if (listType === "declined-invitations") {
        if (currentEvent?._id) {
          setMoreUsersLoading(true);
          Requests.getEventDisinterestedUsers(
            currentEvent._id.toString(),
            userListFetchStart,
            userListFetchLimit
          )
            .then((res) => {
              if (res.ok) {
                res.json().then((disinterestedUsers: TUser[]) => {
                  setIterableUsers(
                    iterableUsers.concat(
                      disinterestedUsers.map((d) => Methods.getTBarebonesUser(d))
                    )
                  );
                });
              } else {
                setFetchUsersIsError(true);
              }
            })
            .catch((error) => console.log(error))
            .finally(() => {
              setMoreUsersLoading(false);
              if (initialFetchIsLoading) {
                setInitialFetchIsLoading(false);
              }
            });
        }
      }

      if (listType === "blocked-users") {
        if (currentUser?._id) {
          setMoreUsersLoading(true);
          Requests.getBlockedUsers(
            currentUser._id.toString(),
            userListFetchStart,
            userListFetchLimit
          )
            .then((res) => {
              if (res.ok) {
                res.json().then((rsvps: TUser[]) => {
                  setIterableUsers(
                    iterableUsers.concat(rsvps.map((r) => Methods.getTBarebonesUser(r)))
                  );
                });
              } else {
                setFetchUsersIsError(true);
              }
            })
            .catch((error) => console.log(error))
            .finally(() => {
              setMoreUsersLoading(false);
              if (initialFetchIsLoading) {
                setInitialFetchIsLoading(false);
              }
            });
        }
      }

      if (listType === "other-user-friends") {
        if (currentUser?._id && currentOtherUser?._id) {
          setMoreUsersLoading(true);
          Requests.getUserByID(currentOtherUser._id.toString())
            .then((res) => {
              if (res.ok) {
                res
                  .json()
                  .then((otherUser: TUser) => {
                    Requests.getOtherUserFriends(
                      otherUser,
                      currentUser,
                      userListFetchStart,
                      userListFetchLimit
                    )
                      .then((otherUserFriends: TUser[] | undefined) => {
                        if (otherUserFriends) {
                          setIterableUsers(
                            iterableUsers.concat(
                              otherUserFriends.map((u) => Methods.getTBarebonesUser(u))
                            )
                          );
                        } else {
                          setFetchUsersIsError(true);
                        }
                      })
                      .catch((error) => console.log(error));
                  })
                  .catch((error) => console.log(error));
              } else {
                setFetchUsersIsError(true);
              }
            })
            .catch((error) => console.log(error))
            .finally(() => {
              setMoreUsersLoading(false);
              if (initialFetchIsLoading) {
                setInitialFetchIsLoading(false);
              }
            });
        }
      }
    }
    console.log(inviteesCurrentEvent);
  }, [
    userListFetchLimit,
    userListFetchStart,
    currentInterest,
    currentEvent,
    interestedUsersCurrentEvent,
    inviteesCurrentEvent,
  ]);

  // make every handler & related request accept TBarebonesUser
  const getButtonOneHandlerParams = (user: TBarebonesUser) => {
    if (!buttonOneHandlerParams) {
      if (
        listType === "blocked-users" &&
        buttonOneHandler === handleUnblockUser &&
        blockedUsers
      ) {
        return [Methods.getTBarebonesUser(currentUser), user];
      } else if (
        (listType === "invitees" || listType === "rsvpd-users") &&
        buttonOneHandler === getStartOrOpenChatWithUserHandler
      ) {
        return [user];
      }
    }
  };

  // make every handler & related request accept TBarebonesUser
  const getButtonTwoHandlerParams = (user: TBarebonesUser) => {
    if (!buttonTwoHandlerParams) {
      if (listType === "invitees" && buttonTwoHandler === handleRemoveInvitee) {
        return [currentEvent, user, inviteesCurrentEvent, setInviteesCurrentEvent];
      }

      if (listType === "rsvpd-users") {
        return [
          currentEvent,
          user,
          undefined,
          interestedUsersCurrentEvent,
          setInterestedUsersCurrentEvent,
        ];
      }
    }
    return undefined;
  };

  const getButtonOneLink = (user: TBarebonesUser): string | null => {
    if (
      listType === "other-user-friends" ||
      listType === "mutual-friends" ||
      "interest-users"
    ) {
      return `/otherUsers/${user.username}`;
    }
    return null;
  };

  const noFetchError: boolean = !fetchUsersIsError && !outsideFetchIsError;

  const anInitialFetchIsLoading: boolean = outsideFetchIsLoading || initialFetchIsLoading;

  return (
    <div tabIndex={0} className="modal-background">
      <i
        tabIndex={0}
        title="Close"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            closeModalMethod(false);
            setUserListFetchStart(0);
            setUserListFetchLimit(10);
          }
        }}
        onClick={() => {
          closeModalMethod(false);
          setUserListFetchStart(0);
          setUserListFetchLimit(10);
        }}
        className="fas fa-times close-module-icon"
      ></i>
      <div
        onScroll={(e) => handleLoadMoreItemsOnScroll(iterableUsers, e)}
        style={{ border: `2px solid ${randomColor}` }}
        className="userListContainer"
      >
        <h2>
          {`${header}`}
          {displayCount && iterableUsers !== null && iterableUsers.length > 0 && (
            <span>{` (${iterableUsers.length})`}</span>
          )}
        </h2>
        {noFetchError &&
          !anInitialFetchIsLoading &&
          iterableUsers !== null &&
          iterableUsers.length > 0 &&
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
              objectLink={`/otherUsers/${user?.username}`}
            />
          ))}
        {noFetchError &&
          !anInitialFetchIsLoading &&
          iterableUsers !== null &&
          iterableUsers.length === 0 &&
          !moreUsersLoading && <p>No users to show</p>}
        {moreUsersLoading && !anInitialFetchIsLoading && <p>Loading...</p>}
        {anInitialFetchIsLoading && (
          <header style={{ marginTop: "3rem" }} className="query-status-text">
            Loading...
          </header>
        )}
        {!noFetchError && !anInitialFetchIsLoading && (
          <p>Couldn't fetch data; try reloading the page.</p>
        )}
      </div>
    </div>
  );
};
export default UserListModal;
