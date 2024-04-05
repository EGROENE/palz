import { useState, useEffect, createContext, ReactNode } from "react";
import { TMainContext, TUser } from "../types";
import Requests from "../requests";
import useLocalStorage from "use-local-storage";

export const MainContext = createContext<TMainContext | null>(null);

export const MainContextProvider = ({ children }: { children: ReactNode }) => {
  const isDefaultDarkTheme: boolean = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [theme, setTheme] = useLocalStorage<"dark" | "light">(
    "theme",
    isDefaultDarkTheme ? "dark" : "light"
  );
  const toggleTheme = (): void => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState<TUser | undefined>(undefined);
  const [allEvents, setAllEvents] = useState([]);
  const [rsvpdEvents, setRsvpdEventsByUser] = useState([]);
  const [favoritedEvents, setFavoritedEventsByUser] = useState([]);
  const [attendedEvents, setAttendedEventsByUser] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [eventsByTag, setEventsByTag] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [userCreatedAccount, setUserCreatedAccount] = useState<null | boolean>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(true);

  useEffect(() => {
    Requests.getAllUsers()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllUsers(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    // Get allEvents:
    Requests.getAllEvents()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllEvents(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getRsvpdEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setRsvpdEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getFavoritedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setFavoritedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getAttendedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAttendedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getUserInterests()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setUserInterests(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getEventsbyTag()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setEventsByTag(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getAllInterests()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllInterests(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [
    allUsers,
    currentUser,
    allEvents,
    rsvpdEvents,
    favoritedEvents,
    attendedEvents,
    userInterests,
    eventsByTag,
    allInterests,
    eventsByTag,
  ]);

  // Call on sub of login/signup forms. As a result, a welcome message appears for 3 secs after login/signup
  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), 3000);
  };

  const mainContextValues: TMainContext = {
    theme,
    toggleTheme,
    allUsers,
    currentUser,
    setCurrentUser,
    allEvents,
    rsvpdEvents,
    favoritedEvents,
    attendedEvents,
    userInterests,
    eventsByTag,
    allInterests,
    userCreatedAccount,
    setUserCreatedAccount,
    showWelcomeMessage,
    setShowWelcomeMessage,
    handleWelcomeMessage,
  };

  return (
    <MainContext.Provider value={mainContextValues}>{children}</MainContext.Provider>
  );
};
