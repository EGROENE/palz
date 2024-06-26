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

  useEffect(() => {
    getMostCurrentEvents();
  }, []);

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

  // REFETCH METHODS
  const fetchAllUsers = (): Promise<void> => Requests.getAllUsers().then(setAllUsers);

  const fetchAllEvents = (): Promise<void> => Requests.getAllEvents().then(setAllEvents);

  // Deletes events that now-nonexistent users had made (if they are now the sole organizer), as well as past events
  // If deleted user organized event w/ others, only filter out their name where applicable, but keep event
  const getMostCurrentEvents = (): void => {
    const now = Date.now();
    fetchAllEvents();
    // Get array of event organizers who still exist. If length of this array is 0, delete event.
    for (const event of allEvents) {
      const refinedOrganizers = [];
      for (const organizer of event.organizers) {
        if (allUsers.filter((user) => user.id === organizer).length > 0) {
          refinedOrganizers.push(organizer);
        }
      }
      if (event.nextEventTime < now || refinedOrganizers.length === 0) {
        Requests.deleteEvent(event);
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
    attendedEvents,
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
