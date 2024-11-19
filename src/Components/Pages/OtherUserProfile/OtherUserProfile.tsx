import { useUserContext } from "../../../Hooks/useUserContext";

const OtherUserProfile = () => {
  const { currentOtherUser } = useUserContext();

  // if currentUser is undefined on initial render, redirect to login page

  return <h1>{currentOtherUser?.firstName}</h1>;
};
export default OtherUserProfile;
