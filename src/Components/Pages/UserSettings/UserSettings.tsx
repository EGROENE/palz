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

const UserSettings = () => {
  const [showAreYouSureInterface, setShowAreYouSureInterface] = useState<boolean>(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState<boolean>(false);
  // Set random color:
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    if (!currentUser) {
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
  } = useUserContext();
  const { allEvents } = useEventContext();

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

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      {isLoading && <LoadingModal message="Saving changes..." />}
      {showBlockedUsers && (
        <UserListModal
          renderButtonOne={false}
          closeModalMethod={setShowBlockedUsers}
          header="Blocked Users"
          handleDeletion={handleUnblockUser}
          userIDArray={blockedUsers}
          deleteFrom="blocked-users"
          randomColor={randomColor}
          buttonTwoText="Unblock"
        />
      )}
      <h1>Settings</h1>
      <EditUserInfoForm
        randomColor={randomColor}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <InterestsSection
        isDisabled={isLoading}
        randomColor={randomColor}
        interestsRelation="user"
        handleAddInterest={handleAddUserInterest}
        handleRemoveInterest={handleDeleteUserInterest}
      />
      {currentUser && currentUser.blockedUsers.length > 0 && (
        <p style={{ width: "76%", textAlign: "left" }}>
          Blocked Users{" "}
          <span
            style={{ "color": randomColor }}
            className={styles.showModule}
            onClick={() => setShowBlockedUsers(!showBlockedUsers)}
          >
            See List
          </span>
        </p>
      )}
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
    </div>
  );
};

export default UserSettings;
