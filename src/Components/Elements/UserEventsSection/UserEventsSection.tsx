import Methods from "../../../methods";
import EventCard from "../EventCard/EventCard";
import { TEvent } from "../../../types";
import styles from "./styles.module.css";
import { useUserContext } from "../../../Hooks/useUserContext";

const UserEventsSection = ({
  eventsArray,
  header,
}: {
  eventsArray: TEvent[];
  header: string;
}) => {
  const { currentUser } = useUserContext();

  // Filter out events from which currentUser has been blocked:
  const eventsFromWhichCurrentUserNotBlocked: TEvent[] = eventsArray.filter((event) =>
    currentUser && currentUser._id
      ? !event.blockedUsersEvent.map((bu) => bu._id).includes(currentUser._id.toString())
      : eventsArray
  );

  return (
    <section className={styles.userEventsSection}>
      <h2>{header}</h2>
      <div className="userEventsSectionEventsContainer">
        {Methods.sortEventsSoonestToLatest(eventsFromWhichCurrentUserNotBlocked).map(
          (event) => (
            <EventCard key={event._id} event={event} />
          )
        )}
      </div>
    </section>
  );
};
export default UserEventsSection;
