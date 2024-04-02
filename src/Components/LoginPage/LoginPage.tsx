import { useLoginContext } from "../../Hooks/useLoginContext";
import SignupForm from "../LoginForms/SignupForm/SignupForm";
import LoginForm from "../LoginForms/LoginForm/LoginForm";

const LoginPage = () => {
  const { signupIsSelected } = useLoginContext();

  return (
    <div className="login-page-container">
      <div className="login-greeting-container">
        <h1>Welcome to Palz!</h1>
        <h2>Do fun things, meet real friends</h2>
      </div>
      {signupIsSelected ? <SignupForm /> : <LoginForm />}
    </div>
  );
};
export default LoginPage;
