import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { TEvent, TThemeColor } from "../../../types";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";

const UsersEvents = () => {
  const { showSidebar, setShowSidebar } = useMainContext();
  const { currentUser, userCreatedAccount } = useUserContext();
  const { allEvents, fetchAllEvents } = useEventContext();

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please log in before accessing this page");
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
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
      currentUser?._id &&
      event.creator !== currentUser?._id &&
      event.organizers.includes(currentUser._id) &&
      event.eventEndDateTimeInMS < now
  );

  const pastEventsUserRSVPd: TEvent[] = allEvents.filter(
    (event) =>
      currentUser?._id &&
      event.interestedUsers.includes(currentUser._id) &&
      event.eventEndDateTimeInMS < now
  );

  const upcomingEventsUserOrganizes: TEvent[] = allEvents.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      event.organizers.includes(currentUser._id)
  );

  const upcomingEventsUserInvitedTo: TEvent[] = allEvents.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      event.invitees.includes(currentUser._id)
  );

  const upcomingEventsUserRSVPdTo: TEvent[] = allEvents.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      event.interestedUsers.includes(currentUser._id)
  );

  const ongoingEvents: TEvent[] = allEvents.filter((event) => {
    event.eventStartDateTimeInMS < now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      (event.organizers.includes(currentUser._id) ||
        event.interestedUsers.includes(currentUser._id));
  });

  const usersEvents = [
    { header: "Events Happening Now", array: ongoingEvents },
    {
      header: "Your Upcoming Events",
      array: upcomingEventsUserOrganizes,
    },
    {
      header: "Upcoming Events You've RSVP'd To",
      array: upcomingEventsUserRSVPdTo,
    },
    {
      header: "Upcoming Events You've Been Invited To",
      array: upcomingEventsUserInvitedTo,
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
