import { Link } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useMainContext } from "../../../Hooks/useMainContext";

const SiteLinks = () => {
  const { currentRoute } = useMainContext();
  const { currentUser } = useUserContext();

  return (
    <div className="site-links-container">
      {currentRoute !== "/add-event" && (
        <Link to={"/add-event"}>
          <div className="theme-element-container">
            <button>Create Event</button>
          </div>
        </Link>
      )}
      {currentRoute !== "/find-events" && (
        <Link to={"/find-events"}>
          <div className="theme-element-container">
            <button>Explore Events</button>
          </div>
        </Link>
      )}
      {currentRoute !== "/find-palz" && (
        <Link to="/find-palz">
          <div className="theme-element-container">
            <button>Find Palz</button>
          </div>
        </Link>
      )}
      {currentRoute !== `/${currentUser?.username}/events` && (
        <Link to={`/${currentUser?.username}/events`}>
          <div className="theme-element-container">
            <button>My Events</button>
          </div>
        </Link>
      )}
      {currentRoute !== "/my-palz" && (
        <Link to={"/my-palz"}>
          <div className="theme-element-container">
            <button>My Palz</button>
          </div>
        </Link>
      )}
    </div>
  );
};
export default SiteLinks;
