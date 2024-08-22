// remember to add handlers for updating existing event in DB and for del existing event in DB. Deletion handler will be passed to InterestsSection, I think

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TEvent, TThemeColor } from "../../../types";
import EventForm from "../../Forms/EventForm/EventForm";

/* prop currentEvent is only possibly undefined b/c the initial value of currentValue in mainContext is undefined (no default value) */
const EditEventPage = ({ currentEvent }: { currentEvent?: TEvent }) => {
  const { currentUser, userCreatedAccount } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    // Set random color:
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  // Bring user to homepage if not logged in:
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
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
