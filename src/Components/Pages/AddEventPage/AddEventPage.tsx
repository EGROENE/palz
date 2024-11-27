import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventForm from "../../Forms/EventForm/EventForm";
import { TThemeColor } from "../../../types";
import toast from "react-hot-toast";

const AddEventPage = () => {
  const navigation = useNavigate();
  const { showSidebar, setShowSidebar } = useMainContext();
  const { currentUser, userCreatedAccount } = useUserContext();

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
      toast.error("Please log in before accessing this page");
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Add New Event</h1>
      <EventForm randomColor={randomColor} />
    </div>
  );
};

export default AddEventPage;
