import { useMainContext } from "../../../Hooks/useMainContext";

const Welcome = () => {
  const { currentUser, userCreatedAccount } = useMainContext();

  return (
    <div className="page-hero">
      {userCreatedAccount ? (
        <h1 className="standalone-element">{`Welcome to Palz, ${currentUser?.firstName}!`}</h1>
      ) : (
        <h1 className="standalone-element">{`Welcome back, ${currentUser?.firstName}!`}</h1>
      )}
    </div>
  );
};
export default Welcome;
