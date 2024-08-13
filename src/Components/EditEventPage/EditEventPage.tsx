// remember to add handlers for updating existing event in DB and for del existing event in DB. Deletion handler will be passed to InterestsSection, I think

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { TEvent } from "../../types";
import NavBar from "../NavBar/NavBar";
import EventForm from "../EventForm/EventForm";

/* prop currentEvent is only possibly undefined b/c the initial value of currentValue in mainContext is undefined (no default value) */
const EditEventPage = ({ currentEvent }: { currentEvent?: TEvent }) => {
  const { currentUser, userCreatedAccount } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  const navigation = useNavigate();

  // Bring user to homepage if not logged in:
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      navigation("/");
    }
  }, [currentEvent, navigation]);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <NavBar />
      <h1>Edit Event</h1>
      <EventForm event={currentEvent} />
    </div>
  );
};
export default EditEventPage;
