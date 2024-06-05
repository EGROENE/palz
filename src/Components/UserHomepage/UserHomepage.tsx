import { useNavigate, Link } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { useEffect } from "react";
import NavBar from "../NavBar/NavBar";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../types";

const UserHomepage = () => {
  const { currentUser, allEvents, userCreatedAccount, getMostCurrentEvents } =
    useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  // On init rendering, hide sidebar, if displayed (better ux when returning to user homepage from Settings, etc.)
  useEffect(() => {
    getMostCurrentEvents();
    if (showSidebar) {
      setShowSidebar(false);
    }
    /* @ts-ignore: Condition must be checked & Sidebar hidden on init rendering of this component only. If any of the recommended dependencies are included, Sidebar will be hidden immediately after it is displayed. */
  }, []);

  useEffect(() => {
    getMostCurrentEvents();
  }, [allEvents]);

  /* If currentUser is undefined, redirect to base URL (/). This prevents access to user account by simply pasting in their acct url. Forces login. Also, this component will only render if currentUser exists. If currentUser is defined, ensure url is set to include their username (after editing user info, then returning to user homepage, 'undefined' was sometimes taking the place of currentUser.username in path). */
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      navigation("/");
    } else {
      navigation(`/users/${currentUser?.username}`);
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const userRSVPDEvents: TEvent[] = allEvents.filter((ev) =>
    currentUser?.id ? ev.interestedUsers.includes(currentUser.id.toString()) : []
  );
  // Sort userRSVPDEvents by earliest date:
  const userRSVPDEventsSoonestToLatest = userRSVPDEvents.sort(
    (a, b) => a.nextEventTime - b.nextEventTime
  );

  return (
    currentUser && (
      <div onClick={() => showSidebar && setShowSidebar(false)} className="page-hero">
        <NavBar />
        {userRSVPDEvents.length ? (
          <div className="upcoming-events-hero">
            <h1>Upcoming Events ({userRSVPDEvents.length})</h1>
            <div
              style={
                userRSVPDEventsSoonestToLatest.length < 3
                  ? { justifyContent: "center", overflowX: "unset" }
                  : undefined
              }
              className="rsvpd-events-container"
            >
              {userRSVPDEventsSoonestToLatest.map((event: TEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : (
          <div className="upcoming-events-hero">
            <h1>No upcoming events</h1>
            <p>
              Click <Link to={"/events"}>here</Link> to find something fun to do
            </p>
          </div>
        )}
        <div className="site-links-container">
          <Link to={"/event-form"}>
            <button>Create Event</button>
          </Link>
          <button>Find Palz</button>
          <Link to={"/events"}>
            <button>Explore Events</button>
          </Link>
          <button>My Palz</button>
        </div>
      </div>
    )
  );
};
export default UserHomepage;
