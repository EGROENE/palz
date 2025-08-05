import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import EditUserInfoForm from "../../Forms/EditUserInfoForm/EditUserInfoForm";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import {
  TEventValuesToUpdate,
  TEvent,
  TThemeColor,
  TUser,
  TUserValuesToUpdate,
} from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { useEventContext } from "../../../Hooks/useEventContext";
import LoadingModal from "../../Elements/LoadingModal/LoadingModal";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import styles from "./styles.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useChatContext } from "../../../Hooks/useChatContext";

const UserSettings = () => {
  const { setCurrentEvent } = useEventContext();
  const [showAreYouSureInterface, setShowAreYouSureInterface] = useState<boolean>(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState<boolean>(false);
  // Set random color:
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      toast.error("Please log in before accessing this page.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      setTimeout(() => logout(), 2000);
      setCurrentEvent(undefined);
    }

    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);

    if (showSidebar) {
      setShowSidebar(false);
    }
    if (!passwordIsHidden) {
      setPasswordIsHidden(true);
    }
  }, []);

  const {
    theme,
    toggleTheme,
    showSidebar,
    setShowSidebar,
    isLoading,
    setIsLoading,
    setError,
    error,
  } = useMainContext();

  if (error) {
    throw new Error(error);
  }

  let {
    currentUser,
    logout,
    passwordIsHidden,
    setPasswordIsHidden,
    setAccountDeletionInProgress,
    handleUnblockUser,
    setCurrentUser,
    userCreatedAccount,
    blockedUsers,
    fetchBlockedUsersIsError,
    fetchBlockedUsersIsLoading,
  } = useUserContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { fetchChatsQuery } = useChatContext();

  const queryClient = useQueryClient();

  const handleDeleteUserInterest = (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();
    setIsLoading(true);
    Requests.deleteUserInterest(currentUser, interest)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete interest. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          if (currentUser && currentUser._id) {
            Requests.getUserByID(currentUser._id.toString())
              .then((res) => {
                if (res.ok) {
                  res
                    .json()
                    .then((user) => {
                      if (user) {
                        setCurrentUser(user);
                        toast(`'${interest}' removed from interests`, {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        });
                      } else {
                        toast.error("Could not delete interest. Please try again.", {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        });
                      }
                    })
                    .catch((error) => console.log(error));
                } else {
                  toast.error("Could not delete interest. Please try again.", {
                    style: {
                      background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                      color: theme === "dark" ? "black" : "white",
                      border: "2px solid red",
                    },
                  });
                }
              })
              .catch((error) => console.log(error));
          }
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Defined here, and not in userContext, as useNavigate hook can only be used in <Router> component (navigation is changed)
  const handleAccountDeletion = (): void => {
    setShowAreYouSureInterface(false);

    setAccountDeletionInProgress(true);

    const promisesToAwait: Promise<Response>[] = [];

    if (currentUser) {
      Requests.getEventsRelatedToUser(currentUser).then((res) => {
        if (res.ok) {
          res.json().then((events: TEvent[]) => {
            if (events.length > 0) {
              for (const event of events) {
                if (
                  currentUser._id &&
                  event.organizers.length === 1 &&
                  event.organizers.includes(currentUser._id.toString())
                ) {
                  promisesToAwait.push(Requests.deleteEvent(event));
                } else {
                  const eventValuesToUpdate: TEventValuesToUpdate = {
                    blockedUsersEvent: event.blockedUsersEvent.filter(
                      (u) => u !== currentUser?._id?.toString()
                    ),
                    invitees: event.invitees.filter(
                      (u) => u !== currentUser?._id?.toString()
                    ),
                    interestedUsers: event.interestedUsers.filter(
                      (u) => u !== currentUser?._id?.toString()
                    ),
                  };

                  promisesToAwait.push(Requests.updateEvent(event, eventValuesToUpdate));
                }
              }
            }

            Requests.getUsersToUpdateWhenCurrentUserDeletesAccount(currentUser).then(
              (res) => {
                if (res.ok) {
                  res.json().then((users: TUser[]) => {
                    if (users.length > 0) {
                      for (const user of users) {
                        const userValuesToUpdate: TUserValuesToUpdate = {
                          friends: user.friends.filter(
                            (elem) => elem !== currentUser._id?.toString()
                          ),
                          friendRequestsReceived: user.friends.filter(
                            (elem) => elem !== currentUser._id?.toString()
                          ),
                          friendRequestsSent: user.friends.filter(
                            (elem) => elem !== currentUser._id?.toString()
                          ),
                          blockedUsers: user.friends.filter(
                            (elem) => elem !== currentUser._id?.toString()
                          ),
                          blockedBy: user.friends.filter(
                            (elem) => elem !== currentUser._id?.toString()
                          ),
                        };

                        promisesToAwait.push(
                          Requests.patchUpdatedUserInfo(user, userValuesToUpdate)
                        );
                      }
                    }

                    // In chats user is in, replace their _id w/ 'Deleted User':
                    const userChats = fetchChatsQuery.data;
                    if (userChats && currentUser && currentUser._id) {
                      for (const userChat of userChats) {
                        const updatedChatMembers = userChat.members.filter(
                          (member) => member !== currentUser._id
                        );
                        let updatedChatAdmins;
                        if (userChat.admins?.includes(currentUser._id.toString())) {
                          // If user is sole admin of chat, delete chat; else, replace their _id w/ 'Deleted User':
                          if (userChat.admins.length - 1 === 0 && userChat._id) {
                            promisesToAwait.push(
                              Requests.deleteChat(userChat._id.toString())
                            );
                          } else {
                            updatedChatAdmins = userChat.admins.filter(
                              (admin) => admin !== currentUser._id
                            );
                          }
                        }
                        const chatValuesToUpdate = {
                          members: updatedChatMembers,
                          admins: updatedChatAdmins,
                        };
                        promisesToAwait.push(
                          Requests.updateChat(userChat, chatValuesToUpdate)
                        );
                      }

                      // Wait for user to be removed from all invitee/organizer/RSVP arrays, then delete user object in DB. Eventually, also wait for user to be removed from palz & messages arrays.
                      // in .finally(), hide deletionInProgress modal
                      Promise.all(promisesToAwait)
                        .then((resArray: Response[]) => {
                          if (!resArray.every((res) => res.ok)) {
                            toast.error(
                              "Account deletion incomplete; please try again.",
                              {
                                style: {
                                  background:
                                    theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                                  color: theme === "dark" ? "black" : "white",
                                  border: "2px solid red",
                                },
                              }
                            );
                          } else {
                            Requests.deleteUser(currentUser?._id?.toString())
                              .then((response) => {
                                if (!response.ok) {
                                  toast.error(
                                    "Account deletion incomplete; please try again.",
                                    {
                                      style: {
                                        background:
                                          theme === "light"
                                            ? "#242424"
                                            : "rgb(233, 231, 228)",
                                        color: theme === "dark" ? "black" : "white",
                                        border: "2px solid red",
                                      },
                                    }
                                  );
                                } else {
                                  // No need to invalidate/refetch userChats, but verify
                                  queryClient.invalidateQueries({
                                    queryKey: ["userChats"],
                                  });
                                  queryClient.refetchQueries({ queryKey: ["userChats"] });
                                  toast(
                                    "You have deleted your account. We're sorry to see you go!",
                                    {
                                      style: {
                                        background:
                                          theme === "light"
                                            ? "#242424"
                                            : "rgb(233, 231, 228)",
                                        color: theme === "dark" ? "black" : "white",
                                        border: "2px solid red",
                                      },
                                    }
                                  );
                                  setTimeout(() => logout(), 2000);
                                  setCurrentEvent(undefined);
                                }
                              })
                              .catch((error) => console.log(error));
                          }
                        })
                        .catch((error) => console.log(error))
                        .finally(() => setAccountDeletionInProgress(false));
                    }
                  });
                } else {
                  setAccountDeletionInProgress(false);
                  setError(
                    "Error deleting account (error deleting users from friends & friend-requests arrays)"
                  );
                }
              }
            );
          });
        } else {
          setAccountDeletionInProgress(false);
          setError(
            "Error deleting account (error deleting users from friends & friend-requests arrays)"
          );
        }
      });
    }
  };

  return (
    <>
      <h1>Settings</h1>
      {isLoading && <LoadingModal message="Saving changes..." />}

      <EditUserInfoForm
        randomColor={randomColor}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <header className="independent-header">
        Blocked Users{" "}
        <span
          tabIndex={0}
          aria-hidden="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowBlockedUsers(!showBlockedUsers);
            }
          }}
          style={{ "color": randomColor }}
          className={styles.showModule}
          onClick={() => setShowBlockedUsers(!showBlockedUsers)}
        >
          See List
        </span>
      </header>
      {showBlockedUsers && (
        <UserListModal
          listType="blocked-users"
          renderButtonOne={true}
          renderButtonTwo={false}
          closeModalMethod={setShowBlockedUsers}
          header="Blocked Users"
          users={blockedUsers}
          fetchUsers={false}
          buttonOneText="Unblock"
          buttonOneHandler={handleUnblockUser}
          buttonOneHandlerNeedsEventParam={false}
          randomColor={randomColor}
          outsideFetchIsError={fetchBlockedUsersIsError}
          outsideFetchIsLoading={fetchBlockedUsersIsLoading}
        />
      )}
      <InterestsSection
        isDisabled={isLoading}
        randomColor={randomColor}
        interestsRelation="user"
        handleRemoveInterest={handleDeleteUserInterest}
      />
      <div className="settings-theme-and-delete-account-container">
        <div>
          <h3>Delete Account</h3>
          <p>
            Any events of which you are the sole organizer will be deleted & all your
            account information will be lost.
          </p>
          <button
            onClick={() => setShowAreYouSureInterface(true)}
            className="delete-button"
          >
            Delete Account
          </button>
        </div>
        <div>
          <h3>Change Site Theme</h3>
          <p>{theme === "dark" ? "Theme is set to dark" : "Theme is set to light"}</p>
          <div className="theme-element-container">
            <button onClick={() => toggleTheme()}>
              {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            </button>
          </div>
        </div>
      </div>
      {showAreYouSureInterface && (
        <TwoOptionsInterface
          header="Are you sure you want to permanently delete your account?"
          subheader="Please understand that this action is
          irreversible."
          buttonOneText="Cancel"
          buttonOneHandler={() => setShowAreYouSureInterface(false)}
          handlerOneNeedsEventParam={false}
          buttonTwoText="Delete Account"
          buttonTwoHandler={handleAccountDeletion}
          handlerTwoNeedsEventParam={false}
          closeHandler={setShowAreYouSureInterface}
        />
      )}
    </>
  );
};

export default UserSettings;
