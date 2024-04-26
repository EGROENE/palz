import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import SignupOrEditUserInfoForm from "../LoginForms/SignupOrEditUserInfoForm/SignupOrEditUserInfoForm";
import NavBar from "../NavBar/NavBar";
import Sidebar from "../Sidebar/Sidebar";

const UserSettings = () => {
  const { currentUser } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
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

  return (
    <>
      <NavBar />
      {showSidebar && <Sidebar />}
      <h1>Settings</h1>
      <SignupOrEditUserInfoForm isOnSignup={false} />
    </>
  );
};

export default UserSettings;
