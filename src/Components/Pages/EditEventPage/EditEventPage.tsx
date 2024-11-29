import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TEvent, TThemeColor } from "../../../types";
import EventForm from "../../Forms/EventForm/EventForm";
import toast from "react-hot-toast";

/* prop currentEvent is only possibly undefined b/c the initial value of currentValue in mainContext is undefined (no default value) */
const EditEventPage = ({ currentEvent }: { currentEvent?: TEvent }) => {
  const { showSidebar, setShowSidebar } = useMainContext();
  const { currentUser, userCreatedAccount, logout } = useUserContext();

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    /* Redirect to user homepage if event has ended (no longer editable). Should only happen if user pastes in url of event's edit page, as navigation options won't exist anymore */
    const now = Date.now();
    if (currentEvent?.eventEndDateTimeInMS && currentEvent.eventEndDateTimeInMS < now) {
      navigation(`/${currentUser?.username}`);
      toast.error("Event is finished, so it's no longer editable.");
    }

    /* If user access event's edit page, but is not an organizer, redirect to their homepage & tell them they don't have permission to edit event */
    if (currentUser?._id && !currentEvent?.organizers.includes(currentUser._id)) {
      navigation(`/${currentUser.username}`);
      toast.error("You do not have permission to edit this event.");
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
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please log in before accessing this page");
      logout();
      navigation("/");
    }
  }, [currentEvent, navigation]);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Edit Event</h1>
      <EventForm randomColor={randomColor} event={currentEvent} />
    </div>
  );
};
export default EditEventPage;
