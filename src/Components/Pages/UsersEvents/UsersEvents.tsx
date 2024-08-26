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

  const pastEventsUserOrganized: TEvent[] = allEvents.filter(
    (event) =>
      currentUser?.id &&
      event.creator !== currentUser?.id &&
      event.organizers.includes(currentUser.id) &&
      event.eventEndDateTimeInMS < now
  );

  const pastEventsUserRSVPd: TEvent[] = allEvents.filter(
    (event) =>
      currentUser?.id &&
      event.interestedUsers.includes(currentUser.id) &&
      event.eventEndDateTimeInMS < now
  );

  const currentUpcomingEventsUserOrganizes: TEvent[] = allEvents.filter(
    (event) =>
      (event.eventStartDateTimeInMS > now || // if start is in future
        event.eventEndDateTimeInMS > now) && // if end is in future
      currentUser?.id &&
      event.organizers.includes(currentUser.id)
  );

  const currentUpcomingEventsUserInvitedTo: TEvent[] = allEvents.filter(
    (event) =>
      (event.eventStartDateTimeInMS > now || // if start is in future
        event.eventEndDateTimeInMS > now) && // if end is in future
      currentUser?.id &&
      event.invitees.includes(currentUser.id)
  );

  const currentUpcomingEventsUserRSVPdTo: TEvent[] = allEvents.filter(
    (event) =>
      (event.eventStartDateTimeInMS > now || // if start is in future
        event.eventEndDateTimeInMS > now) && // if end is in future
      currentUser?.id &&
      event.interestedUsers.includes(currentUser.id)
  );

  const usersEvents = [
    {
      header: "Your Current & Upcoming Events",
      array: currentUpcomingEventsUserOrganizes,
    },
    {
      header: "Current & Upcoming Events You've RSVP'd To",
      array: currentUpcomingEventsUserRSVPdTo,
    },
    {
      header: "Current & Upcoming Events You've Been Invited To",
      array: currentUpcomingEventsUserInvitedTo,
    },
    { header: "Past Events You RSVP'd To", array: pastEventsUserRSVPd },
    { header: "Past Events You Organized", array: pastEventsUserOrganized },
  ];

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Your Events</h1>
      {usersEvents.length > 0 ? (
        usersEvents.map(
          (event) =>
            event.array.length > 0 && (
              <UserEventsSection
                key={event.header}
                eventsArray={event.array}
                header={event.header}
              />
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
