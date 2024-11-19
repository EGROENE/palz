import { useParams } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";

const OtherUserProfile = () => {
  const { allUsers } = useUserContext();
  const { username } = useParams();
  const currentOtherUser = allUsers.filter((user) => user.username === username)[0];

  // if currentUser is undefined on initial render, redirect to login page

  return <h1>{currentOtherUser?.firstName}</h1>;
};
export default OtherUserProfile;
