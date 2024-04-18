import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import SignupOrEditUserInfoForm from "../LoginForms/SignupOrEditUserInfoForm/SignupOrEditUserInfoForm";

const UserSettings = () => {
  // on submit of form below, PATCH all form values to user data object in DB.
  // have 'cancel' btn, along w/ 'save' btn. if 'cancel' is clicked, reset values to what they were previously (if prev state can't be used, have state values here (newFirstName, etc.))
  // PW fields should be 'new pw' and 'confirm new pw'. patch these appropriately
  // outside the form, have theme toggler, list of blocked users

  const { currentUser } = useMainContext();

  // If no current user or whatever, redirect to login, just like in UserHomepage
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigation("/");
    }
  }, [currentUser, navigation]);

  return (
    <>
      <h1>Settings</h1>
      <SignupOrEditUserInfoForm isOnSignup={false} />
    </>
  );
};

export default UserSettings;
