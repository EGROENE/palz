import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import SignupOrEditUserInfoForm from "../LoginForms/SignupOrEditUserInfoForm/SignupOrEditUserInfoForm";
import NavBar from "../NavBar/NavBar";
import Sidebar from "../Sidebar/Sidebar";

const UserSettings = () => {
  // on submit of form below, PATCH all form values to user data object in DB.
  // have 'cancel' btn, along w/ 'save' btn. if 'cancel' is clicked, reset values to what they were previously (if prev state can't be used, have state values here (newFirstName, etc.))
  // PW fields should be 'new pw' and 'confirm new pw'. patch these appropriately
  // outside the form, have theme toggler, list of blocked users

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
