import { useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { TEvent } from "../../../types";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";

const UsersEvents = () => {
  const { allEvents, currentUser, fetchAllEvents, userCreatedAccount } = useMainContext();
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

  const usersEvents = allEvents.filter((ev) =>
    ev.organizers.includes(String(currentUser?.id))
  );

  const eventsUserCreated: TEvent[] = usersEvents.filter(
    (event) => event.creator === currentUser?.id && event.eventEndDateTimeInMS < now
  );

  const eventsUserOrganized: TEvent[] = usersEvents.filter(
    (event) =>
      currentUser?.id &&
      event.creator !== currentUser?.id &&
      event.organizers.includes(currentUser.id) &&
      event.eventEndDateTimeInMS < now
  );

  const eventsUserRSVPd: TEvent[] = usersEvents.filter(
    (event) =>
      currentUser?.id &&
      event.interestedUsers.includes(currentUser.id) &&
      event.eventEndDateTimeInMS < now
  );

  const currentAndUpcomingEvents: TEvent[] = usersEvents.filter(
    (event) =>
      event.eventStartDateTimeInMS > now || // if start is in future
      event.eventEndDateTimeInMS > now // if end is in future
  );

  const arrayOfUserEventArrays: TEvent[][] = [
    currentAndUpcomingEvents,
    eventsUserRSVPd,
    eventsUserCreated,
    eventsUserOrganized,
  ];

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Your Events</h1>
      {usersEvents.length > 0 ? (
        arrayOfUserEventArrays.map(
          (eventsArray) =>
            eventsArray.length > 0 && (
              <UserEventsSection key={eventsArray[0].id} eventsArray={eventsArray} />
            )
        )
      ) : (
        <h2>
          You haven't organized any events yet. Click{" "}
          <Link
            style={{
              color: "var(--theme-orange)",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
            to={"/add-event"}
          >
            here
          </Link>{" "}
          to add one!
        </h2>
      )}
    </div>
  );
};
export default UsersEvents;
