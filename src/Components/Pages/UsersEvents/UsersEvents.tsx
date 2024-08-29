import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { TEvent, TThemeColor } from "../../../types";
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

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);

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

  const userEventsExist = usersEvents
    .map((event) => event.array)
    .some((eventArray) => eventArray.length > 0);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Your Events</h1>
      {userEventsExist ? (
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
        <>
          <h2>
            Once you create/organize, are invited to, or RSVP to events, they will appear
            here.
          </h2>
          <div className="box-link-container">
            <Link to="/add-event">
              <div
                style={{ boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }}
                className="box-link"
              >
                <header>Create Event</header>
                <i className="fas fa-lightbulb"></i>
              </div>
            </Link>
            <Link to="/events">
              <div
                style={{ boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }}
                className="box-link"
              >
                <header>Explore Events</header>
                <i className="fas fa-search"></i>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
export default UsersEvents;
