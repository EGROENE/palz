import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TThemeColor } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

const Sidebar = () => {
  const { currentUser, theme } = useMainContext();
  const {
    showSidebar,
    setShowSidebar,
    profileImage,
    setShowUpdateProfileImageInterface,
  } = useUserContext();
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  return (
    <div
      className={styles.sidebar}
      style={
        theme === "dark"
          ? {
              border: `2px solid ${randomColor}`,
              backgroundColor: "black",
            }
          : { border: `2px solid ${randomColor}`, backgroundColor: "white" }
      }
    >
      <i
        onClick={() => setShowSidebar(!showSidebar)}
        style={{ backgroundColor: randomColor }}
        className={`${styles.sidebarIcon} ${styles.sidebarClose} fas fa-times`}
      ></i>
      <div className={`${styles.sidebarIconContainer} ${styles.sidebarEditProfileImage}`}>
        <i
          style={{ backgroundColor: randomColor }}
          onClick={() => setShowUpdateProfileImageInterface(true)}
          className="fas fa-camera"
        ></i>
      </div>
      <img
        className={`${styles.profileImageSidebar}`}
        src={
          profileImage !== "" && typeof profileImage === "string"
            ? profileImage
            : defaultProfileImage
        }
      />
      <div
        style={{ backgroundColor: randomColor }}
        className={styles.sidebarNamesContainer}
      >
        <p>{`${currentUser?.firstName} ${currentUser?.lastName}`}</p>
        <p>{currentUser?.username}</p>
      </div>
      <div className={styles.sidebarOptionContainer}>
        <Link to={"/add-event"} className={styles.sidebarOption}>
          Create Event
        </Link>
        <Link to={`/${currentUser?.username}/events`} className={styles.sidebarOption}>
          My Events
        </Link>
        <Link className={styles.sidebarOption} to={"/events"}>
          Explore Events
        </Link>
        <Link className={styles.sidebarOption} to="/find-palz">
          Find Palz
        </Link>
        <Link className={styles.sidebarOption} to={"/my-palz"}>
          My Palz
        </Link>
        <Link className={styles.sidebarOption} to="/settings">
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
