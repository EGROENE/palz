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
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { currentUser, userCreatedAccount, fetchAllVisibleOtherUsersQuery, logout } =
    useUserContext();
  const { fetchAllEventsQuery, setCurrentEvent } = useEventContext();

  const allEvents = fetchAllEventsQuery.data;

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      logout();
      setCurrentEvent(undefined);
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
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

    if (showSidebar) {
      setShowSidebar(false);
    }
    window.scrollTo(0, 0);
  }, []);

  const now = Date.now();

  const pastEventsUserOrganized: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      currentUser?._id &&
      event.creator !== currentUser?._id &&
      event.organizers.map((o) => o._id).includes(currentUser._id.toString()) &&
      event.eventEndDateTimeInMS < now
  );

  const pastEventsUserRSVPd: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      currentUser?._id &&
      event.interestedUsers.map((i) => i._id).includes(currentUser._id.toString()) &&
      event.eventEndDateTimeInMS < now
  );

  const upcomingEventsUserOrganizes: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      event.organizers.map((o) => o._id).includes(currentUser._id.toString())
  );

  const upcomingEventsUserInvitedTo: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      event.invitees.map((i) => i._id).includes(currentUser._id.toString())
  );

  const upcomingEventsUserRSVPdTo: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      event.interestedUsers.map((i) => i._id).includes(currentUser._id.toString())
  );

  const ongoingEvents: TEvent[] | undefined = allEvents?.filter((event) => {
    event.eventStartDateTimeInMS < now &&
      event.eventEndDateTimeInMS > now &&
      currentUser?._id &&
      (event.organizers.map((o) => o._id).includes(currentUser._id.toString()) ||
        event.interestedUsers.map((i) => i._id).includes(currentUser._id.toString()));
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
    .some((eventArray) => eventArray && eventArray.length > 0);

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError && !fetchAllVisibleOtherUsersQuery.isError;

  const fetchIsLoading: boolean =
    fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllVisibleOtherUsersQuery.isError) {
      return fetchAllVisibleOtherUsersQuery;
    } else if (fetchAllEventsQuery.isError) {
      return fetchAllEventsQuery;
    }
    return undefined;
  };
  const queryWithError = getQueryForQueryLoadingOrErrorComponent();

  return (
    <>
      <h1>Your Events</h1>
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {queryWithError && (
        <div className="query-error-container">
          <header className="query-status-text">Error fetching data.</header>
          <div className="theme-element-container">
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
      {isNoFetchError &&
        !fetchIsLoading &&
        userEventsExist &&
        usersEvents.map(
          (event) =>
            event &&
            event.array &&
            event.array.length > 0 && (
              <UserEventsSection
                key={event.header}
                eventsArray={event.array}
                header={event.header}
              />
            )
        )}
      {isNoFetchError && !fetchIsLoading && !userEventsExist && (
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
            <Link to="/find-events">
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
    </>
  );
};
export default UsersEvents;
