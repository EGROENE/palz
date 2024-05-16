import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import EditUserInfoForm from "../EditUserInfoForm/EditUserInfoForm";
import Requests from "../../requests";
import toast from "react-hot-toast";

const UserSettings = () => {
  const { currentUser, theme, toggleTheme } = useMainContext();
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

  const handleAccountDeletion = () => {
    Requests.deleteUser(currentUser?.id)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete your account. Please try again.");
        } else {
          toast.error("You have deleted your account. We're sorry to see you go!");
          logout();
          navigation("/");
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div onClick={() => showSidebar && setShowSidebar(false)}>
      <NavBar />
      <h1>Settings</h1>
      <EditUserInfoForm />
      <div className="settings-theme-and-delete-account-container">
        <div>
          <h3>Delete Account</h3>
          <p>Please understand that this action is irreversible</p>
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
