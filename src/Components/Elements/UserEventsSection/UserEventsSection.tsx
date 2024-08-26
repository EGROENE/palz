import Methods from "../../../methods";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../../types";

const UserEventsSection = ({
  eventsArray,
  header,
}: {
  eventsArray: TEvent[];
  header: string;
}) => {
  return (
    <section className="user-events-section">
      <h2>{header}</h2>
      <div className="all-events-container">
        {Methods.sortEventsSoonestToLatest(eventsArray).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};
export default UserEventsSection;
