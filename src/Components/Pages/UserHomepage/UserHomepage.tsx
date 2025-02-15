import { useNavigate, Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEffect } from "react";
import EventCard from "../../Elements/EventCard/EventCard";
import { TEvent } from "../../../types";
import Methods from "../../../methods";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";
import SiteLinks from "../../Elements/SiteLinks/SiteLinks";

const UserHomepage = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { currentUser, userCreatedAccount, username, fetchAllUsersQuery } =
    useUserContext();
  const { allEvents, fetchAllEventsQuery } = useEventContext();

  // On init rendering, hide sidebar, if displayed (better ux when returning to user homepage from Settings, etc.)
  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }
    /* @ts-ignore: Condition must be checked & Sidebar hidden on init rendering of this component only. If any of the recommended dependencies are included, Sidebar will be hidden immediately after it is displayed. */
  }, []);

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("You must be logged in to access this page.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      navigation("/");
    } else {
      navigation(`/${username}`);
    }
  }, [currentUser, navigation, userCreatedAccount]);

  let userRSVPDEvents: TEvent[] = [];
  let userOrganizedEvents: TEvent[] = [];
  let eventsUserIsInvitedTo: TEvent[] = [];
  let allCurrentUserEvents: TEvent[] = [];

  useEffect(() => {
    if (allEvents && currentUser) {
      userRSVPDEvents = allEvents.filter(
        (ev) => currentUser._id && ev.interestedUsers.includes(currentUser._id)
      );

      userOrganizedEvents = allEvents.filter(
        (ev) => currentUser._id && ev.organizers.includes(currentUser._id)
      );

      eventsUserIsInvitedTo = allEvents.filter(
        (ev) =>
          currentUser._id &&
          ev.invitees.includes(currentUser._id) &&
          !ev.disinterestedUsers.includes(currentUser._id)
      );

      allCurrentUserEvents =
        userRSVPDEvents &&
        userOrganizedEvents &&
        eventsUserIsInvitedTo &&
        Methods.removeDuplicatesFromArray(
          userRSVPDEvents.concat(userOrganizedEvents).concat(eventsUserIsInvitedTo)
        );
    }
  }, [fetchAllUsersQuery, fetchAllEventsQuery]);

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError && !fetchAllUsersQuery.isError;

  const fetchIsLoading: boolean =
    fetchAllEventsQuery.isLoading || fetchAllUsersQuery.isLoading;

  return (
    <div onClick={() => showSidebar && setShowSidebar(false)} className="page-hero">
      {fetchIsLoading && <h1>Upcoming Events</h1>}
      {fetchAllEventsQuery.isLoading ||
        (fetchAllUsersQuery.isLoading && (
          <header style={{ marginTop: "3rem" }} className="query-status-text">
            Loading...
          </header>
        ))}
      {fetchAllEventsQuery.isError ||
        (fetchAllUsersQuery.isError && (
          <div className="query-error-container">
            <header className="query-status-text">"Error fetching data.</header>
            <div className="theme-element-container">
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        ))}
      {allCurrentUserEvents &&
        allCurrentUserEvents.length > 0 &&
        !fetchIsLoading &&
        isNoFetchError && (
          <>
            <div className="upcoming-events-hero">
              <h1>Upcoming Events ({allCurrentUserEvents.length})</h1>
              <div
                style={
                  Methods.sortEventsSoonestToLatest(allCurrentUserEvents).length < 3
                    ? { justifyContent: "center", overflowX: "unset" }
                    : undefined
                }
                className="rsvpd-events-container"
              >
                {Methods.sortEventsSoonestToLatest(allCurrentUserEvents).map(
                  (event: TEvent) => (
                    <EventCard key={event._id} event={event} />
                  )
                )}
              </div>
            </div>
            <SiteLinks />
          </>
        )}
      {allCurrentUserEvents &&
        allCurrentUserEvents.length === 0 &&
        !fetchIsLoading &&
        isNoFetchError && (
          <>
            <div className="upcoming-events-hero">
              <h1>No upcoming events</h1>
              <p>
                Click <Link to={"/events"}>here</Link> to find something fun to do
              </p>
            </div>
            <SiteLinks />
          </>
        )}
    </div>
  );
};
export default UserHomepage;
