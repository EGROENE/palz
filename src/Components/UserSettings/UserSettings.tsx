import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import EditUserInfoForm from "../EditUserInfoForm/EditUserInfoForm";
import UserInterestsSection from "../UserInterestsSection/UserInterestsSection";
import Requests from "../../requests";
import toast from "react-hot-toast";

const UserSettings = () => {
  // Set random color:
  const [randomColor, setRandomColor] = useState<string>("");
  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  const { currentUser, theme, toggleTheme, getMostCurrentEvents } = useMainContext();
  const { showSidebar, setShowSidebar, logout, passwordIsHidden, setPasswordIsHidden } =
    useUserContext();

  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }
    if (!passwordIsHidden) {
      setPasswordIsHidden(true);
    }
  }, []);

  // If no current user or whatever, redirect to login, just like in UserHomepage
  // Maybe don't use currentUser to determine if user is logged in
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigation("/");
    }
  }, []);

  // Defined here, and not in userContext, as useNavigate hook can only be used in <Router> component (navigation is changed)
  const handleAccountDeletion = () => {
    Requests.deleteUser(currentUser?.id)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete your account. Please try again.");
          getMostCurrentEvents();
        } else {
          toast.error("You have deleted your account. We're sorry to see you go!");
          logout();
          navigation("/");
          getMostCurrentEvents();
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <NavBar />
      <h1>Settings</h1>
      <EditUserInfoForm randomColor={randomColor} />
      <UserInterestsSection randomColor={randomColor} />
      <div className="settings-theme-and-delete-account-container">
        <div>
          <h3>Delete Account</h3>
          <p>
            Any events of which you are the sole organizer will be deleted & all your
            account information will be lost. Please understand that this action is
            irreversible.
          </p>
          <button onClick={() => handleAccountDeletion()} className="delete-button">
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
    </div>
  );
};

export default UserSettings;
