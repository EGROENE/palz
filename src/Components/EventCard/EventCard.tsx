import { useEffect, useState } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { TEvent } from "../../types";
import { Link } from "react-router-dom";

const EventCard = ({ event }: { event: TEvent }) => {
  const [randomColor, setRandomColor] = useState<string>("");

  const { currentUser } = useMainContext();
  const { handleAddUserRSVP, handleDeleteUserRSVP } = useUserContext();

  const nextEventDateTime: Date = new Date(event.nextEventTime);

  // Set color of event card's border randomly:
  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  // Make sure that this updates after user de-RSVPs
  const userRSVPd: boolean = currentUser?.username
    ? event.interestedUsers.includes(currentUser.username)
    : false;

  return (
    <div className="event-card" style={{ borderColor: randomColor }}>
      <div className="event-info-container">
        <header>{event.title}</header>
        <p>
          {nextEventDateTime.toDateString()} at {nextEventDateTime.toLocaleTimeString()}
        </p>
        <div className="event-buttons-container">
          <Link
            style={{ backgroundColor: randomColor }}
            className="event-buttons-container-button"
            to={`/events/${event.id}`}
          >
            See Event
          </Link>
          <button
            className="event-buttons-container-button"
            onClick={(e) =>
              userRSVPd ? handleDeleteUserRSVP(e, event) : handleAddUserRSVP(e, event)
            }
          >
            {userRSVPd ? "Remove RSVP" : "RSVP"}
          </button>
        </div>
      </div>
      <img src={event.imageOne?.src} alt={event.imageOne?.altText} />
    </div>
  );
};

export default EventCard;
