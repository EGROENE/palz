import { Link } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";

const SiteLinks = () => {
  const { currentUser } = useUserContext();

  return (
    <div className="site-links-container">
      <Link to={"/add-event"}>
        <div className="theme-element-container">
          <button>Create Event</button>
        </div>
      </Link>
      <Link to={"/events"}>
        <div className="theme-element-container">
          <button>Explore Events</button>
        </div>
      </Link>
      <Link to={`/find-palz`}>
        <div className="theme-element-container">
          <button>Find Palz</button>
        </div>
      </Link>
      <Link to={`/${currentUser?.username}/events`}>
        <div className="theme-element-container">
          <button>My Events</button>
        </div>
      </Link>
      <Link to={"/my-palz"}>
        <div className="theme-element-container">
          <button>My Palz</button>
        </div>
      </Link>
    </div>
  );
};
export default SiteLinks;
