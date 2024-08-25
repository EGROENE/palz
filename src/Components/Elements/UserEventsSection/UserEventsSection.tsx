import Methods from "../../../methods";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../../types";

const UserEventsSection = ({ eventsArray }: { eventsArray: TEvent[] }) => {
  return (
    <section className="user-events-section">
      <h2>Past Events You Created</h2>
      <div className="all-events-container">
        {Methods.sortEventsSoonestToLatest(eventsArray).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};
export default UserEventsSection;
