import { useEffect, useState } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { TEvent } from "../../types";
import { Link } from "react-router-dom";

const EventCard = ({ event }: { event: TEvent }) => {
  const [randomColor, setRandomColor] = useState<string>("");

  const { currentUser, allUsers } = useMainContext();
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
  const userRSVPd: boolean = currentUser?.id
    ? event.interestedUsers.includes(currentUser.id.toString())
    : false;

  const refinedOrganizers: string[] = [];
  for (const organizer of event.organizers) {
    if (allUsers.map((user) => user.id).includes(organizer)) {
      refinedOrganizers.push(organizer);
    }
  }

  const getOrganizersUsernames = (): (string | undefined)[] => {
    const usernameArray: Array<string | undefined> = [];
    for (const organizerID of refinedOrganizers) {
      usernameArray.push(allUsers.filter((user) => user.id === organizerID)[0].username);
    }
    return usernameArray;
  };
  const organizerUsernames = getOrganizersUsernames();

  const userIsOrganizer =
    currentUser?.id && refinedOrganizers.includes(currentUser?.id.toString());

  return (
    <div
      className="event-card"
      style={{
        boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
      }}
    >
      <div className="event-info-container">
        <header>{event.title}</header>
        <p>
          {nextEventDateTime.toDateString()} at {nextEventDateTime.toLocaleTimeString()}
        </p>
        <p className="organizers-event-card">
          <i className="fas fa-user-alt"></i>
          {organizerUsernames.length === 1
            ? organizerUsernames[0]
            : `${organizerUsernames[0]}  +${organizerUsernames.length - 1}`}
        </p>
        <div className="event-buttons-container">
          <Link
            style={{ backgroundColor: randomColor }}
            className="event-buttons-container-button"
            to={`/events/${event.id}`}
          >
            See Event
          </Link>
          {/* Necessary to expressly return true or false in 'disabled' attr of button below, or a type error occurs */}
          <button
            disabled={userIsOrganizer ? true : false}
            title={userIsOrganizer ? "Cannot RSVP to an event you organized" : undefined}
            className="event-buttons-container-button"
            onClick={(e) =>
              userRSVPd && currentUser
                ? handleDeleteUserRSVP(e, event, currentUser)
                : handleAddUserRSVP(e, event)
            }
          >
            {userRSVPd ? "Remove RSVP" : "RSVP"}
          </button>
        </div>
      </div>
      <img src={event.imageOne} />
    </div>
  );
};

export default EventCard;
