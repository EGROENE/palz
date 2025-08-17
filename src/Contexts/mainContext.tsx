import { useState, createContext, ReactNode } from "react";
import { TMainContext, TUserSecure, TEvent, TBarebonesUser } from "../types";
import useLocalStorage from "use-local-storage";
import { useLocation } from "react-router-dom";

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

  const currentRoute: string = useLocation().pathname;

  const [error, setError] = useState<string | undefined>();

  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(false);
  const [welcomeMessageDisplayTime, setWelcomeMessageDisplayTime] =
    useState<number>(2500);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayedItems, setDisplayedItems] = useState<
    (TEvent | TUserSecure | TBarebonesUser)[]
  >([]);
  const [showMobileNavOptions, setShowMobileNavOptions] = useState<boolean>(false);
  // fetchStart is here so that it can be immediately set to 0 when clicking links to DisplayedCards pages
  const [fetchStart, setFetchStart] = useState<number>(0);

  // Put here, not in event- or userContext, since it could be used on both
  const [savedInterests, setSavedInterests] = useState<string[]>([]);

  const [showInterestUsers, setShowInterestUsers] = useState<boolean>(false);

  const [interestUsers, setInterestUsers] = useState<TBarebonesUser[]>([]);

  const [currentInterest, setCurrentInterest] = useState<string | null>(null);

  const [interestUsersFetchLimit, setInterestUsersFetchLimit] = useState<number>(10);
  const [interestUsersFetchStart, setInterestUsersFetchStart] = useState<number>(0);
  const [fetchInterestUsersIsLoading, setFetchInterestUsersIsLoading] =
    useState<boolean>(false);
  const [fetchInterestUsersIsError, setFetchInterestUsersIsError] =
    useState<boolean>(false);

  const maximumNumberOfEventsInDB: number = 75;
  const maximumNumberOfUsersDB: number = 50;
  const maximumNumberOfChatsInDB: number = 75;

  const mainContextValues: TMainContext = {
    fetchInterestUsersIsError,
    setFetchInterestUsersIsError,
    fetchInterestUsersIsLoading,
    setFetchInterestUsersIsLoading,
    interestUsersFetchStart,
    setInterestUsersFetchStart,
    interestUsersFetchLimit,
    setInterestUsersFetchLimit,
    currentInterest,
    setCurrentInterest,
    interestUsers,
    setInterestUsers,
    showInterestUsers,
    setShowInterestUsers,
    maximumNumberOfEventsInDB,
    maximumNumberOfUsersDB,
    maximumNumberOfChatsInDB,
    savedInterests,
    setSavedInterests,
    fetchStart,
    setFetchStart,
    error,
    setError,
    showMobileNavOptions,
    setShowMobileNavOptions,
    currentRoute,
    displayedItems,
    setDisplayedItems,
    isLoading,
    setIsLoading,
    showSidebar,
    setShowSidebar,
    theme,
    toggleTheme,
    showWelcomeMessage,
    setShowWelcomeMessage,
    welcomeMessageDisplayTime,
    setWelcomeMessageDisplayTime,
  };

  return (
    <MainContext.Provider value={mainContextValues}>{children}</MainContext.Provider>
  );
};
