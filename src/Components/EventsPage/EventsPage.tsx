import { useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import EventCard from "../EventCard/EventCard";

const EventsPage = () => {
  const { allEvents, getMostCurrentEvents } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  useEffect(() => {
    getMostCurrentEvents();
  }, []);

  return (
    <div
      style={{ "width": "unset" }}
      className="events-page-hero"
      onClick={() => showSidebar && setShowSidebar(false)}
    >
      <NavBar />
      <h1>Events</h1>
      <div className="all-events-container">
        {allEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
