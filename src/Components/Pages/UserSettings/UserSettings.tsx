import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import EditUserInfoForm from "../../Forms/EditUserInfoForm/EditUserInfoForm";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { TOtherUser, TThemeColor } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { useEventContext } from "../../../Hooks/useEventContext";
import LoadingModal from "../../Elements/LoadingModal/LoadingModal";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import styles from "./styles.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useChatContext } from "../../../Hooks/useChatContext";

const UserSettings = () => {
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
      logout();
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
    fetchAllVisibleOtherUsersQuery,
    setCurrentUser,
    userCreatedAccount,
  } = useUserContext();
  const visibleOtherUsers: TOtherUser[] | undefined = fetchAllVisibleOtherUsersQuery.data;

  const { fetchAllEventsQuery } = useEventContext();
  const allEvents = fetchAllEventsQuery.data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { fetchChatsQuery } = useChatContext();

  const queryClient = useQueryClient();

  const handleAddUserInterest = (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();
    setIsLoading(true);
    Requests.addUserInterest(currentUser, interest.trim())
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not add interest. Please try again.", {
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
                        toast.success(`'${interest}' added to interests`, {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid green",
                          },
                        });
                      } else {
                        toast.error("Could not add interest. Please try again.", {
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
                  toast.error("Could not add interest. Please try again.", {
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

    let requestToDeleteUserIDFromAllArraysIsOK: boolean = true; // if any request to del user from pertinent arrays in DB fails, this will be false

    const promisesToAwait: Promise<Response>[] = [];

    // Delete user from event invitees/organizers/RSVP arrays:
    if (allEvents) {
      for (const event of allEvents) {
        // Delete any user RSVPs:
        promisesToAwait.push(Requests.deleteUserRSVP(currentUser, event));

        // Delete user from events they've been invited to:
        promisesToAwait.push(Requests.removeInvitee(event, currentUser));

        // Delete user from events they've organized or delete events of which user is sole organizer:
        if (
          currentUser?._id &&
          event.organizers.length === 1 &&
          event.organizers.includes(currentUser._id.toString())
        ) {
          promisesToAwait.push(Requests.deleteEvent(event));
        } else {
          promisesToAwait.push(Requests.removeOrganizer(event, currentUser));
        }
      }
    }

    // Delete user from friendRequestsReceived & friends arrays in other users' DB documents:
    if (currentUser && visibleOtherUsers) {
      for (const user of visibleOtherUsers) {
        if (user._id) {
          Requests.getUserByID(user._id.toString())
            .then((res) => {
              if (res.ok) {
                res.json().then((user) => {
                  promisesToAwait.push(
                    Requests.removeFromFriendRequestsReceived(currentUser, user),
                    Requests.deleteFriendFromFriendsArray(user, currentUser)
                  );
                });
              } else {
                setError(
                  "Error deleting account (error deleting users from friends & friend-requests arrays)"
                );
              }
            })
            .catch((error) => console.log(error));
        }
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
          if (userChat.admins.length - 1 === 0) {
            promisesToAwait.push(Requests.deleteChat(userChat._id.toString()));
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
        promisesToAwait.push(Requests.updateChat(userChat, chatValuesToUpdate));
      }
    }

    // Wait for user to be removed from all invitee/organizer/RSVP arrays, then delete user object in DB. Eventually, also wait for user to be removed from palz & messages arrays.
    // in .finally(), hide deletionInProgress modal
    Promise.all(promisesToAwait)
      .then(() => {
        for (const promise of promisesToAwait) {
          promise.then((response) => {
            if (!response.ok) {
              requestToDeleteUserIDFromAllArraysIsOK = false;
            }
          });
        }
      })
      .then(() => {
        // run after the others have finished
        if (!requestToDeleteUserIDFromAllArraysIsOK) {
          console.log(1);
          toast.error("Account deletion incomplete; please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          Requests.deleteUser(currentUser?._id?.toString())
            .then((response) => {
              if (!response.ok) {
                console.log(currentUser);
                console.log(0);
                toast.error("Account deletion incomplete; please try again.", {
                  style: {
                    background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                    color: theme === "dark" ? "black" : "white",
                    border: "2px solid red",
                  },
                });
              } else {
                queryClient.invalidateQueries({ queryKey: ["allUsers"] });
                queryClient.invalidateQueries({ queryKey: ["allEvents"] });
                queryClient.refetchQueries({ queryKey: ["allEvents"] });
                queryClient.invalidateQueries({ queryKey: ["userChats"] });
                queryClient.refetchQueries({ queryKey: ["userChats"] });
                toast("You have deleted your account. We're sorry to see you go!", {
                  style: {
                    background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                    color: theme === "dark" ? "black" : "white",
                    border: "2px solid red",
                  },
                });
                logout();
              }
            })
            .catch((error) => console.log(error));
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setAccountDeletionInProgress(false));
  };

  const getBlockedUsersArray = (): string[] => {
    if (currentUser) {
      return currentUser.blockedUsers;
    }
    return [];
  };
  const blockedUsersArray: string[] = getBlockedUsersArray();

  return (
    <>
      {" "}
      <h1>Settings</h1>
      {fetchAllVisibleOtherUsersQuery.isLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {fetchAllVisibleOtherUsersQuery.isError && (
        <div className="query-error-container">
          <header className="query-status-text">Error fetching data.</header>
          <div className="theme-element-container">
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading &&
        isLoading && <LoadingModal message="Saving changes..." />}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading &&
        showBlockedUsers && (
          <UserListModal
            listType="blocked-users"
            renderButtonOne={true}
            renderButtonTwo={false}
            closeModalMethod={setShowBlockedUsers}
            header="Blocked Users"
            userIDArray={blockedUsersArray}
            buttonOneText="Unblock"
            buttonOneHandler={handleUnblockUser}
            buttonOneHandlerNeedsEventParam={false}
            randomColor={randomColor}
          />
        )}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading && (
          <EditUserInfoForm
            randomColor={randomColor}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading &&
        currentUser && (
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
        )}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading && (
          <InterestsSection
            isDisabled={isLoading}
            randomColor={randomColor}
            interestsRelation="user"
            handleAddInterest={handleAddUserInterest}
            handleRemoveInterest={handleDeleteUserInterest}
          />
        )}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading && (
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
        )}
      {!fetchAllVisibleOtherUsersQuery.isError &&
        !fetchAllVisibleOtherUsersQuery.isLoading &&
        showAreYouSureInterface && (
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
