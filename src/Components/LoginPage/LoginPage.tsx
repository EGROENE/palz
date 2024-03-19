import { useLoginContext } from "../../Hooks/useLoginContext";
import SignupForm from "../LoginForms/SignupForm/SignupForm";
import LoginForm from "../LoginForms/LoginForm/LoginForm";

const LoginPage = () => {
  const { signupIsSelected, toggleSignupLogin } = useLoginContext();

  return (
    <>
      <h1>Welcome to Palz!</h1>
      <h2>Do fun things, meet real friends</h2>
      <div className="login-options-container">
        <header
          style={{
            borderBottom: signupIsSelected ? `1px solid var(--theme-green)` : "none",
          }}
          onClick={!signupIsSelected ? () => toggleSignupLogin() : undefined}
        >
          Sign Up
        </header>
        <header
          style={{
            borderBottom: !signupIsSelected ? `1px solid var(--theme-green)` : "none",
          }}
          onClick={signupIsSelected ? () => toggleSignupLogin() : undefined}
        >
          Log In
        </header>
      </div>
      {signupIsSelected ? <SignupForm /> : <LoginForm />}
    </>
  );
};
export default LoginPage;
