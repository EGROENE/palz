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
import Requests from "../../../requests";

const UserHomepage = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { currentUser, userCreatedAccount, username } = useUserContext();
  const { allCurrentUserEvents, setAllCurrentUserEvents } = useEventContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [isFetchError, setIsFetchError] = useState<boolean>(false);
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);

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

    if (currentUser) {
      setFetchIsLoading(true);
      Requests.getEventsRelatedToUser(currentUser)
        .then((res) => {
          if (res.ok) {
            res.json().then((events: TEvent[]) => {
              setAllCurrentUserEvents(events);
            });
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchIsLoading(false));
    } else {
      setIsFetchError(true);
    }
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

  return (
    <>
      {fetchIsLoading && <h1>Upcoming Events</h1>}
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {isFetchError && !fetchIsLoading && (
        <p>Could not fetch your upcoming events; try reloading the page.</p>
      )}
      {allCurrentUserEvents &&
        allCurrentUserEvents.length > 0 &&
        !fetchIsLoading &&
        !isFetchError && (
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
        !isFetchError && (
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
