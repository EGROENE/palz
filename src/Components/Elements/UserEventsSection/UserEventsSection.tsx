import Methods from "../../../methods";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../../types";
import styles from "./styles.module.css";

const UserEventsSection = ({
  eventsArray,
  header,
}: {
  eventsArray: TEvent[];
  header: string;
}) => {
  return (
    <section className={styles.userEventsSection}>
      <h2>{header}</h2>
      <div className={`${styles.userEventsSectionEventsContainer}`}>
        {Methods.sortEventsSoonestToLatest(eventsArray).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};
export default UserEventsSection;
