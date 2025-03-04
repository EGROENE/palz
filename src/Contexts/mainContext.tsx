import { useState, createContext, ReactNode, useEffect } from "react";
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
  const [welcomeMessageDisplayTime, setWelcomeMessageDisplayTime] =
    useState<number>(2500);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number | undefined>();
  const [displayedItemsCountInterval, setDisplayedItemsCountInterval] = useState<
    number | undefined
  >();
  const [displayedItems, setDisplayedItems] = useState<(TEvent | TUser)[]>([]);
  const [displayedItemsFiltered, setDisplayedItemsFiltered] = useState<
    (TEvent | TUser)[]
  >(displayedItems.slice(0, displayedItemsCount));

  useEffect(() => {
    setDisplayedItemsFiltered(displayedItems.slice(0, displayedItemsCount));
  }, [displayedItems]);

  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), welcomeMessageDisplayTime);
  };

  const handleLoadMoreOnScroll = (
    displayedItemsCount: number | null,
    setDisplayedItemsCount: React.Dispatch<React.SetStateAction<number | null>>,
    displayedItemsArray: any[],
    displayedItemsArrayFiltered: any[],
    displayedItemsCountInterval: number | undefined,
    e?: React.UIEvent<HTMLUListElement, UIEvent> | React.UIEvent<HTMLDivElement, UIEvent>
  ): void => {
    const eHTMLElement = e?.target as HTMLElement;
    const scrollTop = e ? eHTMLElement.scrollTop : null;
    const scrollHeight = e ? eHTMLElement.scrollHeight : null;
    const clientHeight = e ? eHTMLElement.clientHeight : null;

    const bottomReached =
      e && scrollTop && clientHeight
        ? scrollTop + clientHeight === scrollHeight
        : window.innerHeight + window.scrollY >= document.body.offsetHeight;

    if (displayedItemsCount && displayedItemsCountInterval && setDisplayedItemsCount) {
      if (bottomReached) {
        if (
          displayedItemsArray.length - displayedItemsArrayFiltered.length >=
          displayedItemsCountInterval
        ) {
          const newDisplayCount = displayedItemsCount + displayedItemsCountInterval;
          setDisplayedItemsCount(newDisplayCount);
          setDisplayedItemsFiltered(displayedItems.slice(0, newDisplayCount));
        } else {
          const newDisplayCount =
            displayedItemsCount +
            (displayedItemsArray.length - displayedItemsArrayFiltered.length);
          setDisplayedItemsCount(newDisplayCount);
          setDisplayedItemsFiltered(displayedItems.slice(0, newDisplayCount));
        }
      }
    }
  };

  const mainContextValues: TMainContext = {
    displayedItemsCountInterval,
    setDisplayedItemsCountInterval,
    displayedItemsFiltered,
    setDisplayedItemsFiltered,
    displayedItemsCount,
    setDisplayedItemsCount,
    handleLoadMoreOnScroll,
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
