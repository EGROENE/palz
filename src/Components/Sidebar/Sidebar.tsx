import { useState, useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";

const Sidebar = () => {
  const { currentUser, theme } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();
  const [borderColor, setBorderColor] = useState<string>("");

  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setBorderColor(themeColors[randomNumber]);
  }, []);

  return (
    <div
      className="sidebar"
      style={
        theme === "dark"
          ? {
              border: `2px solid ${borderColor}`,
              backgroundColor: "black",
            }
          : { border: `2px solid ${borderColor}`, backgroundColor: "white" }
      }
    >
      <i
        onClick={() => setShowSidebar(!showSidebar)}
        style={{ backgroundColor: borderColor }}
        className="fas fa-times"
      ></i>
      <img className="profile-image-sidebar" src={currentUser?.profileImage} />
      <div style={{ backgroundColor: borderColor }} className="sidebar-names-container">
        <p>{`${currentUser?.firstName} ${currentUser?.lastName}`}</p>
        <p>{currentUser?.username}</p>
      </div>
      <p className="sidebar-options">Create Event</p>
      <p className="sidebar-options">Find Palz</p>
      <p className="sidebar-options">Explore Events</p>
      <p className="sidebar-options">My Palz</p>
      <p className="sidebar-options">Find Events</p>
      <p className="sidebar-options">Settings</p>
    </div>
  );
};

export default Sidebar;
