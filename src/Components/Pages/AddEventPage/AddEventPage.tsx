import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventForm from "../../Forms/EventForm/EventForm";
import { TThemeColor } from "../../../types";
import toast from "react-hot-toast";
import LoadingModal from "../../Elements/LoadingModal/LoadingModal";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";

const AddEventPage = () => {
  const navigation = useNavigate();
  const { showSidebar, setShowSidebar, isLoading, theme } = useMainContext();
  const { currentUser, userCreatedAccount, logout, fetchAllUsersQuery } =
    useUserContext();
  const { fetchAllEventsQuery } = useEventContext();

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
  }, []);

  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
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
    !fetchAllEventsQuery.isError && !fetchAllUsersQuery.isError;

  const fetchIsLoading: boolean =
    fetchAllEventsQuery.isLoading || fetchAllUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllUsersQuery.isError) {
      return fetchAllUsersQuery;
    }
    return fetchAllEventsQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      {isLoading && <LoadingModal message="Adding event..." />}
      <h1>Add New Event</h1>
      <QueryLoadingOrError
        query={queryForQueryLoadingOrError}
        errorMessage="Error fetching data."
      />
      {!fetchIsLoading && isNoFetchError && (
        <EventForm randomColor={randomColor} usedFor="add-event" />
      )}
    </div>
  );
};

export default AddEventPage;
