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

const UserSettings = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      "var(--theme-red)",
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

  const { currentUser, theme, toggleTheme, getMostCurrentEvents, fetchAllUsers } =
    useMainContext();
  const { showSidebar, setShowSidebar, logout, passwordIsHidden, setPasswordIsHidden } =
    useUserContext();

  const handleAddUserInterest = (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();
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
      .catch((error) => console.log(error));
  };

  const handleDeleteUserInterest = (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();
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
      .catch((error) => console.log(error));
  };

  // Defined here, and not in userContext, as useNavigate hook can only be used in <Router> component (navigation is changed)
  const handleAccountDeletion = () => {
    Requests.deleteUser(currentUser?.id)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete your account. Please try again.");
          getMostCurrentEvents();
          fetchAllUsers();
        } else {
          toast.error("You have deleted your account. We're sorry to see you go!");
          logout();
          navigation("/");
          getMostCurrentEvents();
          fetchAllUsers();
        }
      })
      .catch((error) => console.log(error));
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
    </div>
  );
};

export default UserSettings;
