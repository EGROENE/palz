import { Link, useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";

const NavBar = () => {
  const { currentUser, userCreatedAccount } = useMainContext();
  const { showSidebar, setShowSidebar, logout } = useUserContext();
  const navigation = useNavigate();

  const handleLogout = () => {
    navigation("/");
    logout();
  };

  return (
    <nav>
      <ul className={styles.navbar}>
        <li>
          <Link to={`/users/${currentUser?.username}`}>
            PALZ IMAGE - LINK TO UserHomepage
          </Link>
        </li>
        <li>
          <Link to={"/settings"}>Settings</Link>
        </li>
        <li>
          <Link to={""}>Terms & Conditions</Link>
        </li>
        {userCreatedAccount !== null ? (
          <li onClick={() => handleLogout()}>
            Log Out<i className="fas fa-sign-out-alt"></i>
          </li>
        ) : (
          <Link to="/">
            Log In/Sign Up<i className="fas fa-sign-out-alt"></i>
          </Link>
        )}
        <li>
          <img
            onClick={() => setShowSidebar(!showSidebar)}
            className={styles.profileImageNavbar}
            src={currentUser?.profileImage}
          />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
