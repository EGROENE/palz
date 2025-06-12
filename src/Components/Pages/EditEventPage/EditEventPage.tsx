import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TEvent, TThemeColor } from "../../../types";
import EventForm from "../../Forms/EventForm/EventForm";
import toast from "react-hot-toast";
import LoadingModal from "../../Elements/LoadingModal/LoadingModal";
import { useEventContext } from "../../../Hooks/useEventContext";

/* prop currentEvent is only possibly undefined b/c the initial value of currentValue in mainContext is undefined (no default value) */
const EditEventPage = ({ event }: { event?: TEvent }) => {
  const { isLoading, theme } = useMainContext();
  const { currentUser, userCreatedAccount, logout, fetchAllVisibleOtherUsersQuery } =
    useUserContext();
  const { currentEvent, fetchAllEventsQuery, fetchPotentialInviteesQuery } =
    useEventContext();

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    /* Redirect to user homepage if event has ended (no longer editable). Should only happen if user pastes in url of event's edit page, as navigation options won't exist anymore */
    const now = Date.now();
    if (event?.eventEndDateTimeInMS && event.eventEndDateTimeInMS < now) {
      navigation(`/${currentUser?.username}`);
      toast.error("Event is finished, so it's no longer editable.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }

    /* If user access event's edit page, but is not an organizer, redirect to their homepage & tell them they don't have permission to edit event */
    if (
      currentUser?._id &&
      !currentEvent?.organizers.map((o) => o._id).includes(currentUser._id.toString())
    ) {
      navigation(`/${currentUser.username}`);
      toast.error("You do not have permission to edit this event.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }

    // Set random color:
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

  // Bring user to homepage if not logged in:
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      logout();
    }

    window.scrollTo(0, 0);
  }, [navigation]);

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllVisibleOtherUsersQuery.isError) {
      return fetchAllVisibleOtherUsersQuery;
    } else if (fetchPotentialInviteesQuery.isError) {
      return fetchPotentialInviteesQuery;
    } else if (fetchAllEventsQuery.isError) {
      return fetchAllEventsQuery;
    }
    return undefined;
  };
  const queryWithError = getQueryForQueryLoadingOrErrorComponent();

  const aQueryIsLoading: boolean =
    fetchAllEventsQuery.isLoading ||
    fetchAllVisibleOtherUsersQuery.isLoading ||
    fetchPotentialInviteesQuery.isLoading;

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError &&
    !fetchAllVisibleOtherUsersQuery.isError &&
    !fetchPotentialInviteesQuery.isError;

  return (
    <>
      {isLoading && <LoadingModal message="Saving changes..." />}
      <h1>Edit Event</h1>
      {aQueryIsLoading && (
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
      {isNoFetchError && !aQueryIsLoading && (
        <EventForm randomColor={randomColor} usedFor="edit-event" event={event} />
      )}
    </>
  );
};
export default EditEventPage;
