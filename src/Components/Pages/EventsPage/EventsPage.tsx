import { useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import Methods from "../../../methods";

const EventsPage = () => {
  const { allEvents, fetchAllEvents, currentUser, userCreatedAccount } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  useEffect(() => {
    fetchAllEvents();
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Events</h1>
      <div className="all-events-container">
        {Methods.sortEventsSoonestToLatest(allEvents).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
