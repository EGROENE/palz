import { useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventCard from "../EventCard/EventCard";
import { Link } from "react-router-dom";
import Methods from "../../methods";

const UsersEvents = () => {
  const { allEvents, currentUser, getMostCurrentEvents, userCreatedAccount } =
    useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  useEffect(() => {
    getMostCurrentEvents();
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  const usersEvents = allEvents.filter((ev) =>
    ev.organizers.includes(String(currentUser?.id))
  );

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Your Events</h1>
      {usersEvents.length > 0 ? (
        <div className="all-events-container">
          {Methods.sortEventsSoonestToLatest(usersEvents).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <h2>
          You haven't organized any events yet. Click{" "}
          <Link
            style={{
              color: "var(--theme-orange)",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
            to={"/add-event"}
          >
            here
          </Link>{" "}
          to add one!
        </h2>
      )}
    </div>
  );
};
export default UsersEvents;
