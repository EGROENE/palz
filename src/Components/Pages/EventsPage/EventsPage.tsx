import { useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import Methods from "../../../methods";
import { TEvent } from "../../../types";

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

  const now = Date.now();
  const getDisplayedEvents = (): TEvent[] => {
    // Later, add filter conditionals here...
    // 'happening now' events should be only events whose end is not -1 (unset) & whose start is before now & end is after

    // If no filters, return events whose end or start is in future:
    return allEvents.filter(
      (event) =>
        event.eventEndDateTimeInMS > now || // end is in future
        event.eventStartDateTimeInMS > now // start is in future
    );
  };
  const displayedEvents: TEvent[] = getDisplayedEvents();

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Events</h1>
      <div className="all-events-container">
        {Methods.sortEventsSoonestToLatest(displayedEvents).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
