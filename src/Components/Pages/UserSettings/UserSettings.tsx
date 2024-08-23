import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import EditUserInfoForm from "../../Forms/EditUserInfoForm/EditUserInfoForm";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { TThemeColor } from "../../../types";
import AreYouSureInterface from "../../Elements/AreYouSureInterface/AreYouSureInterface";
import AccountDeletionInProgressModal from "../../Elements/AccountDeletionInProgressModal/AccountDeletionInProgressModal";

const UserSettings = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accountDeletionInProgress, setAccountDeletionInProgress] =
    useState<boolean>(false);
  const [showAreYouSureInterface, setShowAreYouSureInterface] = useState<boolean>(false);
  // Set random color:
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  const navigation = useNavigate();
  useEffect(() => {
    // If no current user or whatever, redirect to login
    if (!currentUser) {
      navigation("/");
    }

    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
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

  const { currentUser, theme, toggleTheme, fetchAllEvents, fetchAllUsers, allEvents } =
    useMainContext();
  const { showSidebar, setShowSidebar, logout, passwordIsHidden, setPasswordIsHidden } =
    useUserContext();

  const handleAddUserInterest = (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();
    setIsLoading(true);
    Requests.addUserInterest(currentUser, interest.trim())
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not add interest. Please try again.");
          fetchAllUsers();
        } else {
          toast.success(`'${interest}' added to interests`);
          fetchAllUsers();
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
          toast.error("Could not delete interest. Please try again.");
          fetchAllUsers();
        } else {
          toast.success(`'${interest}' removed from interests`);
          fetchAllUsers();
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Defined here, and not in userContext, as useNavigate hook can only be used in <Router> component (navigation is changed)
  const handleAccountDeletion = () => {
    setShowAreYouSureInterface(false);

    setAccountDeletionInProgress(true);

    let requestToDeleteUserIDFromAllArraysIsOK: boolean = true; // if any request to del user from pertinent arrays in DB fails, this will be false

    const promisesToAwait: Promise<Response>[] = [];

    // Delete user from event invitees/organizers/RSVP arrays:
    for (const event of allEvents) {
      // Delete any user RSVPs:
      promisesToAwait.push(Requests.deleteUserRSVP(currentUser, event));
      Requests.deleteUserRSVP(currentUser, event)
        .then((response) => {
          if (!response.ok) {
            requestToDeleteUserIDFromAllArraysIsOK = false;
          }
        })
        .catch((error) => console.log(error));

      // Delete user from events they've been invited to:
      promisesToAwait.push(Requests.removeInvitee(event, currentUser));
      Requests.removeInvitee(event, currentUser)
        .then((response) => {
          if (!response.ok) {
            requestToDeleteUserIDFromAllArraysIsOK = false;
          }
        })
        .catch((error) => console.log(error));

      // Delete user from events they've organized or delete events of which user is sole organizer:
      if (
        currentUser?.id &&
        event.organizers.length === 1 &&
        event.organizers.includes(currentUser.id)
      ) {
        promisesToAwait.push(Requests.deleteEvent(event));
        Requests.deleteEvent(event)
          .then((response) => {
            if (!response.ok) {
              requestToDeleteUserIDFromAllArraysIsOK = false;
            }
          })
          .catch((error) => console.log(error));
      } else {
        promisesToAwait.push(Requests.removeOrganizer(event, currentUser));
        Requests.removeOrganizer(event, currentUser)
          .then((response) => {
            if (!response.ok) {
              requestToDeleteUserIDFromAllArraysIsOK = false;
            }
          })
          .catch((error) => console.log(error));
      }
    }

    // Wait for user to be removed from all invitee/organizer/RSVP arrays, then delete user object in DB. Eventually, also wait for user to be removed from palz & messages arrays.
    // in .finally(), hide deletionInProgress modal
    Promise.all(promisesToAwait)
      .then(() => {
        // run after the others have finished
        if (!requestToDeleteUserIDFromAllArraysIsOK) {
          toast.error("Could not delete your account. Please try again.");
        } else {
          Requests.deleteUser(currentUser?.id)
            .then((response) => {
              if (!response.ok) {
                toast.error("Could not delete your account. Please try again.");
                fetchAllEvents();
                fetchAllUsers();
              } else {
                toast.error("You have deleted your account. We're sorry to see you go!");
                logout();
                navigation("/");
                fetchAllEvents();
                fetchAllUsers();
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
          <button
            style={{ backgroundColor: "rgb(97, 95, 95)" }}
            onClick={() => toggleTheme()}
          >
            {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          </button>
        </div>
      </div>
      {showAreYouSureInterface && (
        <AreYouSureInterface
          message="Are you sure you want to permanently delete your account?"
          subheader="Please understand that this action is
            irreversible."
          noButtonText="Cancel"
          yesButtonText="Delete Account"
          setShowAreYouSureInterface={setShowAreYouSureInterface}
          executionHandler={handleAccountDeletion}
          randomColor={randomColor}
        />
      )}
      {accountDeletionInProgress && <AccountDeletionInProgressModal />}
    </div>
  );
};

export default UserSettings;
