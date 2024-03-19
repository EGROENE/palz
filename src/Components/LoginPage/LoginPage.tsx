import { useState } from "react";
import SignupForm from "../LoginForms/SignupForm/SignupForm";
import LoginForm from "../LoginForms/LoginForm/LoginForm";

const LoginPage = () => {
  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(true);
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  const toggleSignupLogin = () => setSignupIsSelected(!signupIsSelected);
  const toggleHidePassword = () => setPasswordIsHidden(!passwordIsHidden);

  return (
    <>
      <h1>Welcome to Palz!</h1>
      <h2>Do fun things, meet real friends</h2>
      <div>
        <header onClick={() => toggleSignupLogin()}>Sign Up</header>
        <header onClick={() => toggleSignupLogin()}>Log In</header>
      </div>
      {signupIsSelected ? (
        <SignupForm
          passwordIsHidden={passwordIsHidden}
          toggleHidePassword={toggleHidePassword}
          toggleSignupLogin={toggleSignupLogin}
        />
      ) : (
        <LoginForm
          passwordIsHidden={passwordIsHidden}
          toggleHidePassword={toggleHidePassword}
          toggleSignupLogin={toggleSignupLogin}
        />
      )}
    </>
  );
};
export default LoginPage;
