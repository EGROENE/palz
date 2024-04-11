import { Link, useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useLoginContext } from "../../Hooks/useLoginContext";

const NavBar = () => {
  const { currentUser, setUserCreatedAccount, setCurrentUser } = useMainContext();
  const { resetFormFieldsAndErrors } = useLoginContext();
  const navigation = useNavigate();

  const handleLogout = () => {
    navigation("/");
    setUserCreatedAccount(null);
    setCurrentUser(undefined);
    resetFormFieldsAndErrors();
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to={`users/${currentUser?.username}`}>
            PALZ IMAGE - LINK TO UserHomepage
          </Link>
        </li>
        <li>
          <Link to={""}>Settings</Link>
        </li>
        <li>
          <Link to={""}>Terms & Conditions</Link>
        </li>
        <li onClick={() => handleLogout()}>
          Log Out<i className="fas fa-sign-out-alt"></i>
        </li>
        <li>
          <Link to={""}>PUT PROFILE IMG HERE-LINKS TO PROFILE PAGE</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
