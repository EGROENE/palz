import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";

const Sidebar = () => {
  const { currentUser, theme, toggleTheme } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();
  const [randomColor, setRandomColor] = useState<string>("");

  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
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
        className="sidebar-close fas fa-times"
      ></i>
      <img className="profile-image-sidebar" src={currentUser?.profileImage} />
      <div style={{ backgroundColor: randomColor }} className="sidebar-names-container">
        <p>{`${currentUser?.firstName} ${currentUser?.lastName}`}</p>
        <p>{currentUser?.username}</p>
      </div>
      <div className="sidebar-options-container">
        <p className="sidebar-options">Create Event</p>
        <p className="sidebar-options">Find Palz</p>
        <p className="sidebar-options">Explore Events</p>
        <p className="sidebar-options">My Palz</p>
        <p className="sidebar-options">Find Events</p>
        <Link className="sidebar-options" to="/settings">
          Settings
        </Link>
        <button className="theme-toggle-button " onClick={() => toggleTheme()}>
          {theme === "light" ? (
            <span>
              Switch to dark mode <i className="theme-toggle-icon fas fa-moon"></i>
            </span>
          ) : (
            <span>
              Switch to light mode <i className="theme-toggle-icon fas fa-sun"></i>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
