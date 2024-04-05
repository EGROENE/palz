import { useMainContext } from "../../Hooks/useMainContext";

const Welcome = () => {
  const { currentUser, userCreatedAccount } = useMainContext();

  return (
    <>
      {userCreatedAccount ? (
        <h1>{`Welcome to Palz, ${currentUser?.firstName}!`}</h1>
      ) : (
        <h1>{`Welcome back, ${currentUser?.firstName}!`}</h1>
      )}
    </>
  );
};
export default Welcome;
