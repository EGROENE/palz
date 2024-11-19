import "./App.css";
import { useEffect } from "react";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import Welcome from "./Components/Elements/Welcome/Welcome";
import Sidebar from "./Components/Elements/Sidebar/Sidebar";
import UserHomepage from "./Components/Pages/UserHomepage/UserHomepage";
import { useMainContext } from "./Hooks/useMainContext";
import { useUserContext } from "./Hooks/useUserContext";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  useBeforeUnload,
} from "react-router-dom";
import Error404 from "./Components/Pages/Error404/Error404";
import NavBar from "./Components/Elements/NavBar/NavBar";
import UserSettings from "./Components/Pages/UserSettings/UserSettings";
import AddEventPage from "./Components/Pages/AddEventPage/AddEventPage";
import DisplayedCardsPage from "./Components/Pages/DisplayedCardsPage/DisplayedCardsPage";
import EventPage from "./Components/Pages/EventPage/EventPage";
import UsersEvents from "./Components/Pages/UsersEvents/UsersEvents";
import EditEventPage from "./Components/Pages/EditEventPage/EditEventPage";
import TwoOptionsInterface from "./Components/Elements/TwoOptionsInterface/TwoOptionsInterface";
import LoadingModal from "./Components/Elements/LoadingModal/LoadingModal";
import FriendRequests from "./Components/Pages/FriendRequests/FriendRequests";
import OtherUserProfile from "./Components/Pages/OtherUserProfile/OtherUserProfile";
import { useEventContext } from "./Hooks/useEventContext";
import useLocalStorage from "use-local-storage";

function App() {
  const [sessionCount, setSessionCount] = useLocalStorage<number | null>(
    "sessionCount",
    null
  );
  const { theme, showWelcomeMessage, imageIsUploading, imageIsDeleting, showSidebar } =
    useMainContext();
  const {
    userCreatedAccount,
    currentUser,
    showUpdateProfileImageInterface,
    setShowUpdateProfileImageInterface,
    removeProfileImage,
    accountDeletionInProgress,
    logout,
  } = useUserContext();
  const {
    currentEvent,
    eventEditIsInProgress,
    addEventIsInProgress,
    eventDeletionIsInProgress,
  } = useEventContext();

  const navigation = useNavigate();
  const currentURL = useLocation().pathname;

  useEffect(() => {
    if (sessionCount === null) {
      setSessionCount(1);
    } else {
      setSessionCount(sessionCount + 1);
    }
  }, []);

  useBeforeUnload(() => {
    setSessionCount(sessionCount && sessionCount - 1);
    if (sessionCount !== null) {
      if (sessionCount - 1 === 0) {
        logout();
        localStorage.setItem("sessionCount", "0");
      } else {
        setSessionCount(sessionCount - 1);
      }
    }
  });

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
      {showUpdateProfileImageInterface && (
        <TwoOptionsInterface
          header="Edit Profile Image"
          buttonTwoHandler={removeProfileImage}
          buttonOneText="Upload New"
          buttonTwoText="Remove Profile Image"
          closeHandler={setShowUpdateProfileImageInterface}
          isFileUpload={true}
        />
      )}
      {accountDeletionInProgress && <LoadingModal message="Deleting account..." />}
      {addEventIsInProgress && <LoadingModal message="Adding event..." />}
      {eventEditIsInProgress && <LoadingModal message="Updating event..." />}
      {eventDeletionIsInProgress && <LoadingModal message="Deleting event..." />}
      {imageIsUploading && <LoadingModal message="Uploading image..." />}
      {imageIsDeleting && <LoadingModal message="Removing image..." />}
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
        <Route path="/:username/friend-requests" element={<FriendRequests />} />
        <Route path="/:username" element={<UserHomepage />} />
        <Route path="/users/:username" element={<OtherUserProfile />} />
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
