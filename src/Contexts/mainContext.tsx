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
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(false);
  const [welcomeMessageDisplayTime, setWelcomeMessageDisplayTime] = useState<number>(2500);

  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), welcomeMessageDisplayTime);
  };

  useEffect(() => {
    Requests.getAllEvents()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllEvents(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [allEvents]);

  useEffect(() => {
    Requests.getRsvpdEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setRsvpdEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [rsvpdEvents]);

  useEffect(() => {
    Requests.getFavoritedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setFavoritedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [favoritedEvents]);

  useEffect(() => {
    Requests.getAttendedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAttendedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [attendedEvents]);

  useEffect(() => {
    Requests.getUserInterests()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setUserInterests(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [userInterests]);

  useEffect(() => {
    Requests.getEventsbyTag()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setEventsByTag(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [eventsByTag]);

  useEffect(() => {
    Requests.getAllInterests()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllInterests(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [allInterests]);

  useEffect(() => {
    Requests.getAllUsers()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllUsers(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [allUsers]);

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
    handleWelcomeMessage,
    showWelcomeMessage,
    setShowWelcomeMessage,
    welcomeMessageDisplayTime,
    setWelcomeMessageDisplayTime
  };

  return (
    <MainContext.Provider value={mainContextValues}>{children}</MainContext.Provider>
  );
};
