import "./App.css";
import { useEffect } from "react";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import Welcome from "./Components/Elements/Welcome/Welcome";
import Sidebar from "./Components/Elements/Sidebar/Sidebar";
import UserHomepage from "./Components/Pages/UserHomepage/UserHomepage";
import { useMainContext } from "./Hooks/useMainContext";
import { useUserContext } from "./Hooks/useUserContext";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Error404 from "./Components/Pages/Error404/Error404";
import NavBar from "./Components/Elements/NavBar/NavBar";
import UserSettings from "./Components/Pages/UserSettings/UserSettings";
import AddEventPage from "./Components/Pages/AddEventPage/AddEventPage";
import DisplayedCardsPage from "./Components/Pages/DisplayedCardsPage/DisplayedCardsPage";
import EventPage from "./Components/Pages/EventPage/EventPage";
import UsersEvents from "./Components/Pages/UsersEvents/UsersEvents";
import EditEventPage from "./Components/Pages/EditEventPage/EditEventPage";

function App() {
  const { userCreatedAccount, theme, showWelcomeMessage, currentUser, currentEvent } =
    useMainContext();
  const { showSidebar } = useUserContext();

  const navigation = useNavigate();
  const currentURL = useLocation().pathname;

  theme === "dark"
    ? (document.body.style.backgroundColor = "#242424")
    : (document.body.style.backgroundColor = "rgb(233, 231, 228)");

  /* Redirect to user homepage if user has logged in or created account, welcome message not shown (user not able to nav back to login once logged in) */
  /* userCreatedAccount is checked for non-null values, since currentUser may be set before submission of login form, causing user's homepage to display before they actually log in */
  useEffect(() => {
    if (
      userCreatedAccount !== null &&
      !showWelcomeMessage &&
      currentURL === `/users/${currentUser?.username}`
    ) {
      navigation(`users/${currentUser?.username}`);
    }
  }, [
    navigation,
    showWelcomeMessage,
    userCreatedAccount,
    currentUser?.username,
    currentURL,
  ]);

  const getBaseURLElement = (): JSX.Element => {
    if (userCreatedAccount !== null && showWelcomeMessage) {
      return <Welcome />;
    } else if (userCreatedAccount !== null && !showWelcomeMessage) {
      return <UserHomepage />;
    }
    return <LoginPage />;
  };
  const baseURLElement = getBaseURLElement();

  return (
    <div className="app" data-theme={theme}>
      {currentURL !== "/" &&
        baseURLElement !== <Welcome /> &&
        baseURLElement !== <LoginPage /> && <NavBar />}
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={baseURLElement} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/add-event" element={<AddEventPage />} />
        <Route
          path="/edit-event/:eventID"
          element={<EditEventPage currentEvent={currentEvent} />}
        />
        <Route path="/events" element={<DisplayedCardsPage usedFor="events" />} />
        <Route path="/events/:eventID" element={<EventPage />} />
        <Route path="/:username/events" element={<UsersEvents />} />
        <Route path="/users/:username" element={<UserHomepage />} />
        <Route
          path="/find-palz"
          element={<DisplayedCardsPage usedFor="potential-friends" />}
        />
        <Route path="/my-palz" element={<DisplayedCardsPage usedFor="my-friends" />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
