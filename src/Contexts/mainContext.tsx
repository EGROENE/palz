import { useState, createContext, ReactNode } from "react";
import { TMainContext, TOtherUser, TEvent, TBarebonesUser } from "../types";
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
    (TEvent | TOtherUser | TBarebonesUser)[]
  >([]);
  const [showMobileNavOptions, setShowMobileNavOptions] = useState<boolean>(false);
  // fetchStart is here so that it can be immediately set to 0 when clicking links to DisplayedCards pages
  const [fetchStart, setFetchStart] = useState<number>(0);

  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), welcomeMessageDisplayTime);
  };

  const mainContextValues: TMainContext = {
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
