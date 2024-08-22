import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TThemeColor } from "../../../types";

const Sidebar = () => {
  const { currentUser, theme, toggleTheme } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();
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
      className="sidebar"
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
        className="sidebar-icon sidebar-close fas fa-times"
      ></i>
      <i
        onClick={() => toggleTheme()}
        className={
          theme === "light"
            ? "sidebar-icon sidebar-toggle-theme theme-toggle-icon fas fa-moon"
            : "sidebar-icon sidebar-toggle-theme theme-toggle-icon fas fa-sun"
        }
        style={{ backgroundColor: randomColor }}
      ></i>
      <img className="profile-image-sidebar" src={currentUser?.profileImage} />
      <div style={{ backgroundColor: randomColor }} className="sidebar-names-container">
        <p>{`${currentUser?.firstName} ${currentUser?.lastName}`}</p>
        <p>{currentUser?.username}</p>
      </div>
      <div className="sidebar-options-container">
        <Link to={"/add-event"} className="sidebar-options">
          Create Event
        </Link>
        <Link to={`/${currentUser?.username}/events`} className="sidebar-options">
          My Events
        </Link>
        <Link className="sidebar-options" to={"/events"}>
          Explore Events
        </Link>
        <p className="sidebar-options">Find Palz</p>
        <p className="sidebar-options">My Palz</p>
        <Link className="sidebar-options" to="/settings">
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
