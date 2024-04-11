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

  return (
    currentUser && (
      <div className="user-homepage-container">
        <NavBar />
        <h1>Upcoming Events</h1>
        <div className="rsvpd-events-container">
          {userRSVPDEvents.map((event: TEvent) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    )
  );
};
export default UserHomepage;
