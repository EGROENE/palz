import { useNavigate, Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEffect, useState } from "react";
import EventCard from "../../Elements/EventCard/EventCard";
import { TEvent } from "../../../types";
import Methods from "../../../methods";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";
import { TThemeColor } from "../../../types";

const UserHomepage = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { currentUser, userCreatedAccount, username, fetchAllVisibleOtherUsersQuery } =
    useUserContext();
  const { fetchAllEventsQuery, allCurrentUserEvents, setAllCurrentUserEvents } =
    useEventContext();
  const allEvents = fetchAllEventsQuery.data;

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  // On init rendering, hide sidebar, if displayed (better ux when returning to user homepage from Settings, etc.)
  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }
    /* @ts-ignore: Condition must be checked & Sidebar hidden on init rendering of this component only. If any of the recommended dependencies are included, Sidebar will be hidden immediately after it is displayed. */

    // Set color of event card's border randomly:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
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

  useEffect(() => {
    if (allEvents && currentUser) {
      const userRSVPDEvents: TEvent[] = allEvents.filter(
        (ev) => currentUser._id && ev.interestedUsers.includes(currentUser._id.toString())
      );

      const userOrganizedEvents: TEvent[] = allEvents.filter(
        (ev) => currentUser._id && ev.organizers.includes(currentUser._id.toString())
      );

      const eventsUserIsInvitedTo: TEvent[] = allEvents.filter(
        (ev) =>
          currentUser._id &&
          ev.invitees.includes(currentUser._id.toString()) &&
          !ev.disinterestedUsers.includes(currentUser._id.toString())
      );

      setAllCurrentUserEvents(
        Methods.removeDuplicatesFromArray(
          userRSVPDEvents.concat(userOrganizedEvents).concat(eventsUserIsInvitedTo)
        )
      );
    }
  }, [fetchAllVisibleOtherUsersQuery.data, fetchAllEventsQuery.data, currentUser]);

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError && !fetchAllVisibleOtherUsersQuery.isError;

  const fetchIsLoading: boolean =
    fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  return (
    <>
      {fetchIsLoading && <h1>Upcoming Events</h1>}
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {fetchAllEventsQuery.isError ||
        (fetchAllVisibleOtherUsersQuery.isError && (
          <div className="query-error-container">
            <header className="query-status-text">Error fetching data.</header>
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
            <div aria-hidden="false" className="upcoming-events-hero">
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
                Click{" "}
                <Link style={{ color: randomColor }} to={"/find-events"}>
                  here
                </Link>{" "}
                to find something fun to do
              </p>
            </div>
          </>
        )}
    </>
  );
};
export default UserHomepage;
