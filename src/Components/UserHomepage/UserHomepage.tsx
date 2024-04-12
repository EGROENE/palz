import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useEffect } from "react";
import NavBar from "../NavBar/NavBar";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../types";

const UserHomepage = () => {
  const { currentUser, allEvents } = useMainContext();

  /* If currentUser is undefined, redirect to base URL (/). This prevents access to user account by simply pasting in their acct url. Forces login. Also, this component will only render if currentUser exists */
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigation("/");
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
      <div className="user-homepage-container">
        <NavBar />
        <h1>Upcoming Events ({userRSVPDEvents.length})</h1>
        <div className="rsvpd-events-container">
          {userRSVPDEventsSoonestToLatest.map((event: TEvent) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
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
