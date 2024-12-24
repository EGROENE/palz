import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

const NavBar = () => {
  const { showSidebar, setShowSidebar } = useMainContext();
  const { logout, profileImage, currentUser, userCreatedAccount } = useUserContext();

  return (
    <nav>
      <ul className={styles.navbar}>
        <li>
          <Link className="palz-logo" to={`/${currentUser?.username}`}>
            <img src="../src/assets/palz.png" />
            <header>PALZ</header>
          </Link>
        </li>
        <li>
          <Link to={"/settings"}>Settings</Link>
        </li>
        <li>
          <Link to={""}>Terms & Conditions</Link>
        </li>
        {userCreatedAccount !== null ? (
          <li onClick={() => logout()}>
            Log Out<i className="fas fa-sign-out-alt"></i>
          </li>
        ) : (
          <Link to="/">
            Log In/Sign Up<i className="fas fa-sign-out-alt"></i>
          </Link>
        )}
        <li>
          <div className={styles.profileImageContainer}>
            <img
              onClick={() => setShowSidebar(!showSidebar)}
              className={styles.profileImageNavbar}
              src={
                profileImage !== "" && typeof profileImage === "string"
                  ? profileImage
                  : defaultProfileImage
              }
            />
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
