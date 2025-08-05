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
}: {
  listType:
    | "invitees"
    | "rsvpd-users"
    | "other-user-friends"
    | "blocked-users"
    | "blocked-users-event"
    | "mutual-friends"
    | "declined-invitations";
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
}) => {
  const { isLoading } = useMainContext();
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

  const [iterableUsers, setIterableUsers] = useState<TBarebonesUser[] | null>(null);

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);

  useEffect(() => {
    if (fetchUsers && users) {
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
      if (users && !outsideFetchIsError) {
        if (users.every((u) => Methods.isTBarebonesUser(u))) {
          setIterableUsers(users);
        }
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
    if (listType === "other-user-friends" || listType === "mutual-friends") {
      return `/otherUsers/${user.username}`;
    }
    return null;
  };

  const noFetchError: boolean = !isFetchError && !outsideFetchIsError;

  const noFetchIsLoading: boolean = !fetchIsLoading && !outsideFetchIsLoading;

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
        {noFetchError &&
          noFetchIsLoading &&
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
                objectLink={`/otherUsers/${user?.username}`}
              />
            ))
          ) : (
            <p>No users to show</p>
          ))}
        {!noFetchIsLoading && (
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
