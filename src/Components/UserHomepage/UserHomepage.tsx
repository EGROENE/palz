import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useEffect } from "react";

const UserHomepage = () => {
  const { currentUser } = useMainContext();

  /* If currentUser is undefined, redirect to base URL (/). This prevents access to user account by simply pasting in their acct url. Forces login. Also, this component will only render if currentUser exists */
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigation("/");
    }
  }, [currentUser, navigation]);

  return (
    currentUser && (
      <>
        <h1>Homepage</h1>
        <p>hello</p>
      </>
    )
  );
};
export default UserHomepage;
