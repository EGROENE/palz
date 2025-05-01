import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TThemeColor } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import Methods from "../../../methods";

const Sidebar = () => {
  const { showSidebar, setShowSidebar, theme, currentRoute } = useMainContext();
  const {
    profileImage,
    currentUser,
    setShowUpdateProfileImageInterface,
    friendRequestsReceived,
  } = useUserContext();
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
      aria-hidden="false"
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
        tabIndex={0}
        aria-hidden="false"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setShowSidebar(!showSidebar);
          }
        }}
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
          tabIndex={0}
          aria-hidden="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowUpdateProfileImageInterface(true);
            }
          }}
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
        {currentRoute !== "/add-event" && (
          <Link to={"/add-event"} className={styles.sidebarOption}>
            Create Event
          </Link>
        )}
        {currentRoute !== `/${currentUser?.username}/events` && (
          <Link to={`/${currentUser?.username}/events`} className={styles.sidebarOption}>
            My Events
          </Link>
        )}
        {currentRoute !== "/events" && (
          <Link className={styles.sidebarOption} to={"/events"}>
            Explore Events
          </Link>
        )}
        {currentRoute !== `/${currentUser?.username}/friend-requests` && (
          <Link
            className={styles.sidebarOption}
            to={`/${currentUser?.username}/friend-requests`}
          >
            {
              <>
                Friend Requests{" "}
                {friendRequestsReceived && friendRequestsReceived.length > 0 && (
                  <span className="notifications-count">
                    {Methods.removeDuplicatesFromArray(friendRequestsReceived).length}
                  </span>
                )}
              </>
            }
          </Link>
        )}
        {currentRoute !== "/find-palz" && (
          <Link className={styles.sidebarOption} to="/find-palz">
            Find Palz
          </Link>
        )}
        {currentRoute !== "/my-palz" && (
          <Link className={styles.sidebarOption} to={"/my-palz"}>
            My Palz
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
