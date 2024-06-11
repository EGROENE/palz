import { useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import EventCard from "../EventCard/EventCard";
import Methods from "../../methods";

const UsersEvents = () => {
  const { allEvents, currentUser, getMostCurrentEvents } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  useEffect(() => {
    getMostCurrentEvents();
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  const usersEvents = allEvents.filter((ev) =>
    ev.organizers.includes(String(currentUser?.id))
  );

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <NavBar />
      <h1>Events</h1>
      <div className="all-events-container">
        {Methods.sortEventsSoonestToLatest(usersEvents).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
export default UsersEvents;
