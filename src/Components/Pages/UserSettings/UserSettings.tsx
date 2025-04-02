import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import EditUserInfoForm from "../../Forms/EditUserInfoForm/EditUserInfoForm";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { TThemeColor } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { useEventContext } from "../../../Hooks/useEventContext";
import LoadingModal from "../../Elements/LoadingModal/LoadingModal";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import styles from "./styles.module.css";
import { useQueryClient } from "@tanstack/react-query";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";
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

  const { theme, toggleTheme, showSidebar, setShowSidebar, isLoading, setIsLoading } =
    useMainContext();
  let {
    currentUser,
    allUsers,
    logout,
    passwordIsHidden,
    setPasswordIsHidden,
    setAccountDeletionInProgress,
    handleUnblockUser,
    blockedUsers,
    fetchAllUsersQuery,
    setCurrentUser,
    userCreatedAccount,
  } = useUserContext();
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
          queryClient.invalidateQueries({ queryKey: ["allUsers"] });
          if (fetchAllUsersQuery.data && currentUser) {
            allUsers = fetchAllUsersQuery.data;
            setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
          }
          toast.success(`'${interest}' added to interests`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
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
          queryClient.invalidateQueries({ queryKey: ["allUsers"] });
          if (fetchAllUsersQuery.data && currentUser) {
            allUsers = fetchAllUsersQuery.data;
            setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
          }
          toast(`'${interest}' removed from interests`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
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
          event.organizers.includes(currentUser._id)
        ) {
          promisesToAwait.push(Requests.deleteEvent(event));
        } else {
          promisesToAwait.push(Requests.removeOrganizer(event, currentUser));
        }
      }
    }

    // Delete user from friendRequestsReceived & friends arrays in other users' DB documents:
    if (currentUser && allUsers) {
      for (const user of allUsers) {
        promisesToAwait.push(
          Requests.removeFromFriendRequestsReceived(currentUser, user),
          Requests.deleteFriendFromFriendsArray(user, currentUser)
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
        if (userChat.admins?.includes(currentUser._id)) {
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
          toast.error("Account deletion incomplete; please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          Requests.deleteUser(currentUser?._id)
            .then((response) => {
              if (!response.ok) {
                toast.error("Account deletion incomplete; please try again.", {
                  style: {
                    background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                    color: theme === "dark" ? "black" : "white",
                    border: "2px solid red",
                  },
                });
              } else {
                queryClient.invalidateQueries({ queryKey: ["allUsers"] });
                queryClient.invalidateQueries({ queryKey: "allEvents" });
                queryClient.refetchQueries({ queryKey: ["allEvents"] });
                queryClient.invalidateQueries({ queryKey: "userChats" });
                queryClient.refetchQueries({ queryKey: ["userChats"] });
                if (fetchAllUsersQuery.data) {
                  allUsers = fetchAllUsersQuery.data;
                }
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
    if (allUsers && currentUser) {
      if (blockedUsers && blockedUsers.length > 0) {
        return blockedUsers;
      }
    }
    return [];
  };
  const blockedUsersArray: string[] = getBlockedUsersArray();

  return (
    <>
      {" "}
      <h1>Settings</h1>
      <QueryLoadingOrError
        query={fetchAllUsersQuery}
        errorMessage="Error fetching data"
      />
      {!fetchAllUsersQuery.isError && !fetchAllUsersQuery.isLoading && isLoading && (
        <LoadingModal message="Saving changes..." />
      )}
      {!fetchAllUsersQuery.isError &&
        !fetchAllUsersQuery.isLoading &&
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
      {!fetchAllUsersQuery.isError && !fetchAllUsersQuery.isLoading && (
        <EditUserInfoForm
          randomColor={randomColor}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      {!fetchAllUsersQuery.isError && !fetchAllUsersQuery.isLoading && currentUser && (
        <header
          className="independent-header"
          style={{ width: "76%", textAlign: "left" }}
        >
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
      {!fetchAllUsersQuery.isError && !fetchAllUsersQuery.isLoading && (
        <InterestsSection
          isDisabled={isLoading}
          randomColor={randomColor}
          interestsRelation="user"
          handleAddInterest={handleAddUserInterest}
          handleRemoveInterest={handleDeleteUserInterest}
        />
      )}
      {!fetchAllUsersQuery.isError && !fetchAllUsersQuery.isLoading && (
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
      {!fetchAllUsersQuery.isError &&
        !fetchAllUsersQuery.isLoading &&
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
