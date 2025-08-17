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
  outsideFetchIsError,
  outsideFetchIsLoading,
  displayCount,
  loadMoreOnScroll,
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
  users: (string | TBarebonesUser)[] | null;
  fetchUsers: boolean;
  setUsers?: React.Dispatch<React.SetStateAction<string[]>>;
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
  loadMoreOnScroll?: boolean;
}) => {
  const {
    isLoading,
    setInterestUsersFetchStart,
    interestUsersFetchLimit,
    interestUsersFetchStart,
    currentInterest,
    setFetchInterestUsersIsError,
  } = useMainContext();
  const { currentUser, blockedUsers, handleUnblockUser } = useUserContext();

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

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);

  const [moreUsersLoading, setMoreUsersLoading] = useState<boolean>(false);

  useEffect(() => {
    if (fetchUsers && users && !loadMoreOnScroll) {
      setFetchIsLoading(true);
      const getPromisesForFullUserObjects = (): Promise<TUser>[] => {
        // Forced to get promisesToAwait by using loop due to tsc error
        let promisesToAwait: Promise<TUser>[] = [];
        for (const elem of users) {
          if (typeof elem === "string") {
            promisesToAwait.push(
              Requests.getUserByID(elem).then((res) => {
                return res.json().then((user: TUser) => user);
              })
            );
          }
        }
        return promisesToAwait;
      };

      Promise.all(getPromisesForFullUserObjects())
        .then((users: TUser[]) => {
          // Forced to use loop to get var for setIterableUsers due to tsc error otherwise
          let updatedIterableUsers: TBarebonesUser[] = [];
          for (const u of users) {
            if (currentUser?._id) {
              const currentUserIsFriend: boolean = u.friends.includes(
                currentUser?._id?.toString()
              );
              const currentUserIsFriendOfFriend: boolean = u.friends.some((f) =>
                currentUser.friends.includes(f)
              );
              if (
                currentUser &&
                currentUser._id &&
                u._id &&
                !currentUser.blockedUsers.includes(u._id.toString()) &&
                !u.blockedUsers.includes(currentUser._id.toString()) &&
                (u.profileVisibleTo === "anyone" ||
                  (u.profileVisibleTo === "friends" && currentUserIsFriend) ||
                  (u.profileVisibleTo === "friends of friends" &&
                    currentUserIsFriendOfFriend))
              ) {
                updatedIterableUsers.push(Methods.getTBarebonesUser(u));
              }
            }
          }
          setIterableUsers(updatedIterableUsers);
        })
        .catch((error) => {
          console.log(error);
          setIsFetchError(true);
        })
        .finally(() => setFetchIsLoading(false));
    } else {
      if (users && !outsideFetchIsError) {
        // forced to get var for setIterableUsers by loop due to tsc error when running build
        let updatedIterableUsers: TBarebonesUser[] = [];
        for (const u of users) {
          if (Methods.isTBarebonesUser(u)) {
            updatedIterableUsers.push(u);
          }
        }
        setIterableUsers(updatedIterableUsers);
      }
    }
  }, [
    listType,
    currentUser?.blockedUsers,
    currentEvent?.invitees,
    currentEvent?.interestedUsers,
    interestedUsersCurrentEvent,
    inviteesCurrentEvent,
  ]);

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
        setInterestUsersFetchStart(lastItem.index + 1);
      }
    }
  };

  useEffect(() => {
    if (loadMoreOnScroll && currentUser?.username && currentInterest) {
      setMoreUsersLoading(true);
      Requests.getInterestUsers(
        currentInterest,
        interestUsersFetchStart,
        interestUsersFetchLimit,
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
            setFetchInterestUsersIsError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setMoreUsersLoading(false));
    }
  }, [interestUsersFetchLimit, interestUsersFetchStart, currentInterest]);

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

  const noFetchError: boolean = !isFetchError && !outsideFetchIsError;

  const aFetchIsLoading: boolean =
    outsideFetchIsLoading !== undefined ? fetchIsLoading || outsideFetchIsLoading : false;

  return (
    <div tabIndex={0} className="modal-background">
      <i
        tabIndex={0}
        title="Close"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            closeModalMethod(false);
          }
        }}
        onClick={() => closeModalMethod(false)}
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
          !aFetchIsLoading &&
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
          !aFetchIsLoading &&
          iterableUsers !== null &&
          iterableUsers.length === 0 &&
          !moreUsersLoading && <p>No users to show</p>}
        {moreUsersLoading && <p>Loading...</p>}
        {aFetchIsLoading && (
          <header style={{ marginTop: "3rem" }} className="query-status-text">
            Loading...
          </header>
        )}
        {!noFetchError && <p>Couldn't fetch data; try reloading the page.</p>}
      </div>
    </div>
  );
};
export default UserListModal;
