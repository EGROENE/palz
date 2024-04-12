import { Link, useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useLoginContext } from "../../Hooks/useLoginContext";

const NavBar = () => {
  const { currentUser, setUserCreatedAccount, removeCurrentUser } = useMainContext();
  const { resetFormFieldsAndErrors } = useLoginContext();
  const navigation = useNavigate();

  const handleLogout = () => {
    navigation("/");
    setUserCreatedAccount(null);
    removeCurrentUser();
    resetFormFieldsAndErrors();
  };

  return (
    <nav>
      <ul className="navbar">
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
          <img className="profile-image-navbar" src={currentUser?.profileImage} />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
