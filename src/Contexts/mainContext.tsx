import { useState, createContext, ReactNode } from "react";
import { TMainContext, TUser, TEvent } from "../types";
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

  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(false);
  const [imageIsUploading, setImageIsUploading] = useState<boolean>(false);
  const [imageIsDeleting, setImageIsDeleting] = useState<boolean>(false);
  const [welcomeMessageDisplayTime, setWelcomeMessageDisplayTime] =
    useState<number>(2500);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayedCards, setDisplayedCards] = useState<(TEvent | TUser)[]>([]);

  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), welcomeMessageDisplayTime);
  };

  const mainContextValues: TMainContext = {
    displayedCards,
    setDisplayedCards,
    isLoading,
    setIsLoading,
    showSidebar,
    setShowSidebar,
    imageIsUploading,
    setImageIsUploading,
    imageIsDeleting,
    setImageIsDeleting,
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
