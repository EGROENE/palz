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
  const [imageIsUploading, setImageIsUploading] = useState<boolean>(false);
  const [imageIsDeleting, setImageIsDeleting] = useState<boolean>(false);
  const [welcomeMessageDisplayTime, setWelcomeMessageDisplayTime] =
    useState<number>(2500);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayCount, setDisplayCount] = useState<number | undefined>();
  const [displayCountInterval, setDisplayCountInterval] = useState<number | undefined>();
  const [displayedItems, setDisplayedItems] = useState<(TEvent | TUser)[]>([]);
  const [displayedItemsFiltered, setDisplayedItemsFiltered] = useState<
    (TEvent | TUser)[]
  >(displayedItems.slice(0, displayCount));

  useEffect(() => {
    setDisplayedItemsFiltered(displayedItems.slice(0, displayCount));
  }, [displayedItems]);

  const handleWelcomeMessage = () => {
    setShowWelcomeMessage(true);
    setTimeout(() => setShowWelcomeMessage(false), welcomeMessageDisplayTime);
  };

  const handleLoadMoreOnScroll = (
    displayCount: number | undefined,
    setDisplayCount: React.Dispatch<React.SetStateAction<number | undefined>>,
    displayedItemsArray: any[],
    displayedItemsArrayFiltered: any[],
    displayCountInterval: number | undefined,
    e?: React.UIEvent<HTMLUListElement, UIEvent> | React.UIEvent<HTMLDivElement, UIEvent>
  ): void => {
    const eHTMLElement = e?.target as HTMLElement;
    const scrollTop = e ? eHTMLElement.scrollTop : null;
    const scrollHeight = e ? eHTMLElement.scrollHeight : null;
    const clientHeight = e ? eHTMLElement.clientHeight : null;

    const bottomReached =
      e && scrollTop && clientHeight
        ? scrollTop + clientHeight === scrollHeight
        : window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

    if (displayCount && displayCountInterval && setDisplayCount) {
      if (bottomReached) {
        console.log(displayedItemsArray.length);
        console.log(displayedItemsArrayFiltered.length);
        console.log(displayCountInterval);

        if (
          displayedItemsArray.length - displayedItemsArrayFiltered.length >=
          displayCountInterval
        ) {
          const newDisplayCount = displayCount + displayCountInterval;
          setDisplayCount(newDisplayCount);
          setDisplayedItemsFiltered(displayedItems.slice(0, newDisplayCount));
        } else {
          const newDisplayCount =
            displayCount +
            (displayedItemsArray.length - displayedItemsArrayFiltered.length);
          setDisplayCount(newDisplayCount);
          setDisplayedItemsFiltered(displayedItems.slice(0, newDisplayCount));
        }
      }
    }
  };

  const mainContextValues: TMainContext = {
    displayCountInterval,
    setDisplayCountInterval,
    displayedItemsFiltered,
    setDisplayedItemsFiltered,
    displayCount,
    setDisplayCount,
    handleLoadMoreOnScroll,
    displayedItems,
    setDisplayedItems,
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
