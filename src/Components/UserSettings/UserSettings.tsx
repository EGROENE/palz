import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useLoginContext } from "../../Hooks/useLoginContext";
import { useUserContext } from "../../Hooks/useUserContext";
import SignupOrEditUserInfoForm from "../LoginForms/SignupOrEditUserInfoForm/SignupOrEditUserInfoForm";
import NavBar from "../NavBar/NavBar";
import Sidebar from "../Sidebar/Sidebar";
import Requests from "../../requests";
import toast from "react-hot-toast";

const UserSettings = () => {
  const { currentUser } = useMainContext();
  const { passwordIsHidden, setPasswordIsHidden } = useLoginContext();
  const { showSidebar, setShowSidebar, logout } = useUserContext();

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
    <>
      <NavBar />
      {showSidebar && <Sidebar />}
      <h1>Settings</h1>
      <SignupOrEditUserInfoForm isOnSignup={false} />
      <h3>Delete Account</h3>
      <p>Please understand that this action is irreversible</p>
      <button onClick={() => handleAccountDeletion()} className="delete-button">
        Delete Account
      </button>
    </>
  );
};

export default UserSettings;
