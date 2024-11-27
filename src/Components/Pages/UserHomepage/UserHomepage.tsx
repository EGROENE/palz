import { useNavigate, Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEffect } from "react";
import EventCard from "../../Elements/EventCard/EventCard";
import { TEvent } from "../../../types";
import Methods from "../../../methods";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";

const UserHomepage = () => {
  const { showSidebar, setShowSidebar } = useMainContext();
  const { currentUser, userCreatedAccount, username } = useUserContext();
  const { allEvents, fetchAllEvents } = useEventContext();

  // On init rendering, hide sidebar, if displayed (better ux when returning to user homepage from Settings, etc.)
  useEffect(() => {
    fetchAllEvents();
    if (showSidebar) {
      setShowSidebar(false);
    }
    /* @ts-ignore: Condition must be checked & Sidebar hidden on init rendering of this component only. If any of the recommended dependencies are included, Sidebar will be hidden immediately after it is displayed. */
  }, []);

  /* If currentUser is undefined, redirect to base URL (/). This prevents access to user account by simply pasting in their acct url. Forces login. Also, this component will only render if currentUser exists. If currentUser is defined, ensure url is set to include their username (after editing user info, then returning to user homepage, 'undefined' was sometimes taking the place of currentUser.username in path). */
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please log in before accessing this page");
      navigation("/");
    } else {
      navigation(`/${username}`);
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const userRSVPDEvents: TEvent[] = allEvents.filter(
    (ev) => currentUser?._id && ev.interestedUsers.includes(currentUser._id)
  );
  const userOrganizedEvents: TEvent[] = allEvents.filter(
    (ev) => currentUser?._id && ev.organizers.includes(currentUser._id)
  );
  const eventsUserIsInvitedTo = allEvents.filter(
    (ev) =>
      currentUser?._id &&
      ev.invitees.includes(currentUser._id) &&
      !ev.disinterestedUsers.includes(currentUser._id)
  );
  const allCurrentUserEvents = Methods.removeDuplicatesFromArray(
    userRSVPDEvents.concat(userOrganizedEvents).concat(eventsUserIsInvitedTo)
  );

  return (
    currentUser && (
      <div onClick={() => showSidebar && setShowSidebar(false)} className="page-hero">
        {allCurrentUserEvents.length ? (
          <div className="upcoming-events-hero">
            <h1>Upcoming Events ({allCurrentUserEvents.length})</h1>
            <div
              style={
                Methods.sortEventsSoonestToLatest(allCurrentUserEvents).length < 3
                  ? { justifyContent: "center", overflowX: "unset" }
                  : undefined
              }
              className="rsvpd-events-container"
            >
              {Methods.sortEventsSoonestToLatest(allCurrentUserEvents).map(
                (event: TEvent) => (
                  <EventCard key={event._id} event={event} />
                )
              )}
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
          <Link to={`/${currentUser.username}/events`}>
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
      </div>
    )
  );
};
export default UserHomepage;
