import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { TEvent, TThemeColor } from "../../../types";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";
import Requests from "../../../requests";

const UsersEvents = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();

  const { currentUser, userCreatedAccount, logout } = useUserContext();

  const { setCurrentEvent } = useEventContext();

  const [ongoingEvents, setOngoingEvents] = useState<TEvent[] | null>(null);
  const [fetchOngoingEventsIsLoading, setFetchOngoingEventsIsLoading] =
    useState<boolean>(true);

  const [upcomingEventsUserRSVPdTo, setUpcomingEventsUserRSVPdTo] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchUpcomingEventsUserRSVPdToIsLoading,
    setFetchUpcomingEventsUserRSVPdToIsLoading,
  ] = useState<boolean>(true);

  const [upcomingEventsUserOrganizes, setUpcomingEventsUserOrganizes] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchUpcomingEventsUserOrganizesIsLoading,
    setFetchUpcomingEventsUserOrganizesIsLoading,
  ] = useState<boolean>(true);

  const [recentEventsUserRSVPdTo, setRecentEventsUserRSVPdTo] = useState<TEvent[] | null>(
    null
  );
  const [
    fetchRecentEventsUserRSVPdToIsLoading,
    setFetchRecentEventsUserRSVPdToIsLoading,
  ] = useState<boolean>(true);

  const [upcomingEventsUserInvitedTo, setUpcomingEventsUserInvitedTo] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchUpcomingEventsUserInvitedToIsLoading,
    setFetchUpcomingEventsUserInvitedToIsLoading,
  ] = useState<boolean>(true);

  const [recentEventsUserOrganized, setRecentEventsUserOrganized] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchRecentEventsUserOrganizedIsLoading,
    setFetchRecentEventsUserOrganizedIsLoading,
  ] = useState<boolean>(true);

  const [isFetchError, setIsFetchError] = useState<boolean>(false);

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
    } else {
      if (currentUser && currentUser.username) {
        Requests.getOngoingEvents(currentUser.username)
          .then((res) => {
            if (res.ok) {
              res.json().then((ongoingEvents: TEvent[]) => {
                setOngoingEvents(ongoingEvents);
              });
            } else {
              setIsFetchError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setFetchOngoingEventsIsLoading(false));
        Requests.getUpcomingEventsUserRSVPdTo(currentUser.username)
          .then((res) => {
            if (res.ok) {
              res.json().then((evs: TEvent[]) => {
                setUpcomingEventsUserRSVPdTo(evs);
              });
            } else {
              setIsFetchError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setFetchUpcomingEventsUserRSVPdToIsLoading(false));

        Requests.getUpcomingEventsUserOrganizes(currentUser.username)
          .then((res) => {
            if (res.ok) {
              res.json().then((evs: TEvent[]) => {
                setUpcomingEventsUserOrganizes(evs);
              });
            } else {
              setIsFetchError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setFetchUpcomingEventsUserOrganizesIsLoading(false));

        Requests.getRecentEventsUserRSVPdTo(currentUser.username)
          .then((res) => {
            if (res.ok) {
              res.json().then((evs: TEvent[]) => {
                setRecentEventsUserRSVPdTo(evs);
              });
            } else {
              setIsFetchError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setFetchRecentEventsUserRSVPdToIsLoading(false));

        Requests.getUpcomingEventsUserInvitedTo(currentUser.username)
          .then((res) => {
            if (res.ok) {
              res.json().then((evs: TEvent[]) => {
                setUpcomingEventsUserInvitedTo(evs);
              });
            } else {
              setIsFetchError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setFetchUpcomingEventsUserInvitedToIsLoading(false));

        Requests.getRecentEventsUserOrganized(currentUser.username)
          .then((res) => {
            if (res.ok) {
              res.json().then((evs: TEvent[]) => {
                setRecentEventsUserOrganized(evs);
              });
            } else {
              setIsFetchError(true);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setFetchRecentEventsUserOrganizedIsLoading(false));
      } else {
        setIsFetchError(true);
      }
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const userEventsExist: boolean =
    (ongoingEvents && ongoingEvents.length > 0) ||
    (upcomingEventsUserRSVPdTo && upcomingEventsUserRSVPdTo.length > 0) ||
    (upcomingEventsUserOrganizes && upcomingEventsUserOrganizes.length > 0) ||
    (recentEventsUserRSVPdTo && recentEventsUserRSVPdTo.length > 0) ||
    (upcomingEventsUserInvitedTo && upcomingEventsUserInvitedTo.length > 0) ||
    (recentEventsUserOrganized && recentEventsUserOrganized.length > 0)
      ? true
      : false;

  const fetchIsLoading: boolean =
    fetchOngoingEventsIsLoading ||
    fetchUpcomingEventsUserRSVPdToIsLoading ||
    fetchUpcomingEventsUserOrganizesIsLoading ||
    fetchRecentEventsUserRSVPdToIsLoading ||
    fetchUpcomingEventsUserInvitedToIsLoading ||
    fetchRecentEventsUserOrganizedIsLoading;

  return (
    <>
      <h1>Your Events</h1>
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {isFetchError && !fetchIsLoading && (
        <p>Error loading your events; please reload the page.</p>
      )}
      {!isFetchError && !fetchIsLoading && userEventsExist && (
        <>
          {ongoingEvents && ongoingEvents.length > 0 && (
            <UserEventsSection eventsArray={ongoingEvents} header="Your Ongoing Events" />
          )}
          {upcomingEventsUserInvitedTo && upcomingEventsUserInvitedTo.length > 0 && (
            <UserEventsSection
              eventsArray={upcomingEventsUserInvitedTo}
              header="Upcoming Events You've Been Invited To"
            />
          )}
          {upcomingEventsUserRSVPdTo && upcomingEventsUserRSVPdTo.length > 0 && (
            <UserEventsSection
              eventsArray={upcomingEventsUserRSVPdTo}
              header="Upcoming Events You've RSVPd To"
            />
          )}
          {upcomingEventsUserOrganizes && upcomingEventsUserOrganizes.length > 0 && (
            <UserEventsSection
              eventsArray={upcomingEventsUserOrganizes}
              header="Upcoming Events You're Organizing"
            />
          )}
          {recentEventsUserOrganized && recentEventsUserOrganized.length > 0 && (
            <UserEventsSection
              eventsArray={recentEventsUserOrganized}
              header="Upcoming Events You Organized"
            />
          )}
          {recentEventsUserRSVPdTo && recentEventsUserRSVPdTo.length > 0 && (
            <UserEventsSection
              eventsArray={recentEventsUserRSVPdTo}
              header="Recent Events You RSVPd To"
            />
          )}
        </>
      )}
      {!isFetchError && !fetchIsLoading && !userEventsExist && (
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
