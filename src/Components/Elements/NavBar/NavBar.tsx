import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import { useChatContext } from "../../../Hooks/useChatContext";
import { TChat } from "../../../types";

const NavBar = () => {
  const { showSidebar, setShowSidebar, currentRoute, setShowMobileNavOptions } =
    useMainContext();
  const { logout, profileImage, currentUser, userCreatedAccount } = useUserContext();
  const { getTotalNumberOfUnreadMessages, fetchChatsQuery } = useChatContext();

  const userChats: TChat[] | undefined = fetchChatsQuery.data;

  const totalUnreadUserMessages: string | number | undefined =
    userChats && userChats.length > 0
      ? getTotalNumberOfUnreadMessages(userChats)
      : undefined;

  const screenWidth: number = Number(window.screen.width);

  return screenWidth > 1024 ? (
    <nav>
      <ul className={styles.navbar}>
        <li>
          <Link className="palz-logo" to={`/${currentUser?.username}`}>
            <img src="../src/assets/palz.png" />
            <header>PALZ</header>
          </Link>
        </li>
        {currentRoute !== "/chats" && (
          <li style={{ display: "flex", alignItems: "center" }}>
            <Link to={"/chats"}>Chats</Link>
            {totalUnreadUserMessages && (
              <span className="notifications-count">{totalUnreadUserMessages}</span>
            )}
          </li>
        )}
        {currentRoute !== "/settings" && (
          <li>
            <Link to={"/settings"}>Settings</Link>
          </li>
        )}
        {currentRoute !== "/terms-and-conditions" && (
          <li>
            <Link to={"/terms-and-conditions"}>Terms & Conditions</Link>
          </li>
        )}
        {userCreatedAccount !== null ? (
          <li
            tabIndex={0}
            aria-hidden="false"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                logout();
              }
            }}
            onClick={() => logout()}
          >
            Log Out<i className="fas fa-sign-out-alt"></i>
          </li>
        ) : (
          <Link to="/">
            Log In/Sign Up<i className="fas fa-sign-out-alt"></i>
          </Link>
        )}
        <li
          tabIndex={0}
          aria-hidden="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowSidebar(!showSidebar);
            }
          }}
        >
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
  ) : (
    <div className="hamburger-container">
      <Link className="palz-logo" to={`/${currentUser?.username}`}>
        <img src="../src/assets/palz.png" />
        <header>PALZ</header>
      </Link>
      <i
        onClick={() => setShowMobileNavOptions(true)}
        id="hamburger"
        className="fas fa-hamburger"
      ></i>
    </div>
  );
};

export default NavBar;
