import { useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";
import EventForm from "../EventForm/EventForm";

const AddEventForm = () => {
  const navigation = useNavigate();
  const { currentUser, userCreatedAccount } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <NavBar />
      <h1>Add New Event</h1>
      <EventForm />
    </div>
  );
};

export default AddEventForm;
