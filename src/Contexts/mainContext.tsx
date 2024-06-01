import { useState, useEffect, createContext, ReactNode } from "react";
import { useSessionStorage } from "usehooks-ts";
import { TMainContext, TUser, TEvent } from "../types";
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

  const [allUsers, setAllUsers] = useSessionStorage<TUser[]>("allUsers", []);
  const [currentUser, setCurrentUser, removeCurrentUser] = useSessionStorage<
    TUser | undefined
  >("currentUser", undefined);
  const [allEvents, setAllEvents] = useState<TEvent[]>([]);
  const [rsvpdEvents, setRsvpdEventsByUser] = useState([]);
  const [favoritedEvents, setFavoritedEventsByUser] = useState([]);
  const [attendedEvents, setAttendedEventsByUser] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [eventsByTag, setEventsByTag] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [userCreatedAccount, setUserCreatedAccount] = useState<null | boolean>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(false);
  const [welcomeMessageDisplayTime, setWelcomeMessageDisplayTime] =
    useState<number>(2500);

  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), welcomeMessageDisplayTime);
  };

  useEffect(() => {
    fetchAllUsers();
  }, [allUsers]);

  useEffect(() => {
    getMostCurrentEvents();
  }, []);

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

  // REFETCH METHODS
  const fetchAllUsers = (): Promise<void> => Requests.getAllUsers().then(setAllUsers);

  const fetchAllEvents = (): Promise<void> => Requests.getAllEvents().then(setAllEvents);

  // call alongside fetchAllEvents wherever events are rendered
  const getMostCurrentEvents = (): void => {
    const now = Date.now();
    fetchAllEvents();
    for (const event of allEvents) {
      if (event.nextEventTime < now) {
        Requests.deletePastEvent(event);
      }
    }
    fetchAllEvents();
  };

  const mainContextValues: TMainContext = {
    getMostCurrentEvents,
    fetchAllUsers,
    fetchAllEvents,
    theme,
    toggleTheme,
    allUsers,
    currentUser,
    setCurrentUser,
    removeCurrentUser,
    allEvents,
    setAllEvents,
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
    setWelcomeMessageDisplayTime,
  };

  return (
    <MainContext.Provider value={mainContextValues}>{children}</MainContext.Provider>
  );
};
