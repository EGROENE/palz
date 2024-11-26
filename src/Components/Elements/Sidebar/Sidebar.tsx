import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TThemeColor } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

const Sidebar = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { profileImage, currentUser, setShowUpdateProfileImageInterface } =
    useUserContext();
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
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
        style={
          randomColor === "var(--primary-color)"
            ? { backgroundColor: randomColor, color: "black" }
            : { backgroundColor: randomColor, color: "white" }
        }
        className={`${styles.sidebarIcon} ${styles.sidebarClose} fas fa-times`}
      ></i>
      <div className={`${styles.sidebarIconContainer} ${styles.sidebarEditProfileImage}`}>
        <i
          style={
            randomColor === "var(--primary-color)"
              ? { backgroundColor: randomColor, color: "black" }
              : { backgroundColor: randomColor, color: "white" }
          }
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
        <p
          style={
            randomColor === "var(--primary-color)"
              ? { color: "black" }
              : { color: "white" }
          }
        >{`${currentUser?.firstName} ${currentUser?.lastName}`}</p>
        <p
          style={
            randomColor === "var(--primary-color)"
              ? { color: "black" }
              : { color: "white" }
          }
        >
          {currentUser?.username}
        </p>
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
        <Link
          className={styles.sidebarOption}
          to={`/${currentUser?.username}/friend-requests`}
        >
          Friend Requests
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
