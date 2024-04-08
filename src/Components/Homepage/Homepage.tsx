import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";

const Homepage = () => {
  const { currentUser } = useMainContext();

  // if currentUser is undefined, redirect to base URL (/)
  // Prevents
  const navigation = useNavigate();
  if (!currentUser) {
    navigation("/");
  }
  return <>{currentUser && <h1>Homepage</h1>}</>;
};
export default Homepage;
