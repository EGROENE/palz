import { useNavigate, Link } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { useEffect } from "react";
import NavBar from "../NavBar/NavBar";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../types";

const UserHomepage = () => {
  const { currentUser, allEvents } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  // On init rendering, hide sidebar, if displayed (better ux when returning to user homepage from Settings, etc.)
  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }
    /* @ts-ignore: Condition must be checked & Sidebar hidden on init rendering of this component only. If any of the recommended dependencies are included, Sidebar will be hidden immediately after it is displayed. */
  }, []);

  /* If currentUser is undefined, redirect to base URL (/). This prevents access to user account by simply pasting in their acct url. Forces login. Also, this component will only render if currentUser exists. If currentUser is defined, ensure url is set to include their username (after editing user info, then returning to user homepage, 'undefined' was sometimes taking the place of currentUser.username in path). */
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigation("/");
    } else {
      navigation(`/users/${currentUser?.username}`);
    }
  }, [currentUser, navigation]);

  const userRSVPDEvents: TEvent[] = allEvents.filter((event) => {
    return currentUser ? event.interestedUsers.includes(currentUser.username) : [];
  });
  // Sort userRSVPDEvents by earliest date:
  const userRSVPDEventsSoonestToLatest = userRSVPDEvents.sort(
    (a, b) => a.nextEventTime - b.nextEventTime
  );

  return (
    currentUser && (
      <div
        onClick={() => showSidebar && setShowSidebar(false)}
        className="user-homepage-container"
      >
        <NavBar />
        {userRSVPDEvents.length ? (
          <div className="upcoming-events-hero">
            <h1>Upcoming Events ({userRSVPDEvents.length})</h1>
            <div className="rsvpd-events-container">
              {userRSVPDEventsSoonestToLatest.map((event: TEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : (
          <div className="upcoming-events-hero">
            <h1>No upcoming events</h1>
            <p>
              Click <Link to={""}>here</Link> to find something fun to do
            </p>
          </div>
        )}
        <div className="site-links-container">
          <button>Create Event</button>
          <button>Find Palz</button>
          <button>Explore Events</button>
          <button>My Palz</button>
          <button>Find Events</button>
        </div>
      </div>
    )
  );
};
export default UserHomepage;
