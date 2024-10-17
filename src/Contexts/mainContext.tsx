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

  /* Necessary to keep allUsers & allEvents in session storage instead of state b/c I couldn't figure out how to get these again when reloading some components, like LoginPage & EventPage. Probably something about async I'm missing. Wouldn't be necessary to do this in the case of a RESTful API, as one could likely get the required data w/ a search parameter. */
  const [allUsers, setAllUsers] = useSessionStorage<TUser[]>("allUsers", []);
  const [currentUser, setCurrentUser, removeCurrentUser] = useSessionStorage<
    TUser | undefined
  >("currentUser", undefined);
  const [currentEvent, setCurrentEvent] = useSessionStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing
  const [allEvents, setAllEvents] = useSessionStorage<TEvent[]>("allEvents", []);
  const [attendedEvents, setAttendedEventsByUser] = useState([]);
  const [userCreatedAccount, setUserCreatedAccount] = useSessionStorage<boolean | null>(
    "userCreatedAccount",
    null
  );
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

  // CHANGE PORT NUMBER IN REQUEST TO 4000
  useEffect(() => {
    fetchAllEvents();
  }, [allEvents]);

  /* useEffect(() => {
    Requests.getAttendedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAttendedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, [attendedEvents]); */

  // REFETCH METHODS
  const fetchAllUsers = (): Promise<void> => Requests.getAllUsers().then(setAllUsers);

  const fetchAllEvents = (): Promise<void> => Requests.getAllEvents().then(setAllEvents);

  const mainContextValues: TMainContext = {
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
    attendedEvents,
    currentEvent,
    setCurrentEvent,
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
