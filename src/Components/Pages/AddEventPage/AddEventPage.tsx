import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventForm from "../../Forms/EventForm/EventForm";
import { TThemeColor } from "../../../types";
import toast from "react-hot-toast";
import LoadingModal from "../../Elements/LoadingModal/LoadingModal";

const AddEventPage = () => {
  const navigation = useNavigate();
  const { isLoading, theme } = useMainContext();
  const { currentUser, userCreatedAccount, logout, fetchAllVisibleOtherUsersQuery } =
    useUserContext();
  const {
    fetchAllEventsQuery,
    fetchPotentialCoOrganizersQuery,
    fetchPotentialInviteesQuery,
  } = useEventContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
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
    window.scrollTo(0, 0);
  }, []);

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
  }, [currentUser, navigation, userCreatedAccount]);

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError &&
    !fetchAllVisibleOtherUsersQuery.isError &&
    !fetchPotentialCoOrganizersQuery.isError &&
    !fetchPotentialInviteesQuery.isError;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllVisibleOtherUsersQuery.isError) {
      return fetchAllVisibleOtherUsersQuery;
    } else if (fetchPotentialCoOrganizersQuery.isError) {
      return fetchPotentialCoOrganizersQuery;
    } else if (fetchPotentialInviteesQuery.isError) {
      return fetchPotentialInviteesQuery;
    } else if (fetchAllEventsQuery.isError) {
      return fetchAllEventsQuery;
    }
    return undefined;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  const aQueryIsLoading: boolean =
    fetchAllEventsQuery.isLoading ||
    fetchAllVisibleOtherUsersQuery.isLoading ||
    fetchPotentialCoOrganizersQuery.isLoading ||
    fetchPotentialInviteesQuery.isLoading;

  return (
    <>
      {isLoading && <LoadingModal message="Adding event..." />}
      <h1>Add New Event</h1>
      {aQueryIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {queryForQueryLoadingOrError && (
        <div className="query-error-container">
          <header className="query-status-text">Error fetching data.</header>
          <div className="theme-element-container">
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
      {!aQueryIsLoading && isNoFetchError && (
        <EventForm randomColor={randomColor} usedFor="add-event" />
      )}
    </>
  );
};

export default AddEventPage;
