import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OtherUserProfile = () => {
  const navigation = useNavigate();
  const { allUsers, currentUser, userCreatedAccount } = useUserContext();
  const { username } = useParams();
  const currentOtherUser = allUsers.filter((user) => user.username === username)[0];

  // if currentUser is undefined on initial render, redirect to login page
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please login before accessing this page");
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  return <h1>{currentOtherUser?.firstName}</h1>;
};
export default OtherUserProfile;
