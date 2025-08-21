import { useEffect, useRef, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate, Link } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import UserCard from "../../Elements/UserCard/UserCard";
import Methods from "../../../methods";
import {
  TEvent,
  TThemeColor,
  TUser,
  TUserSecure,
  TDisplayedCardsFilter,
  TBarebonesUser,
} from "../../../types";
import FilterDropdown from "../../Elements/FilterDropdown/FilterDropdown";
import SearchBar from "../../Elements/SearchBar/SearchBar";
import toast from "react-hot-toast";
import Requests from "../../../requests";
import { useEventContext } from "../../../Hooks/useEventContext";

const DisplayedCardsPage = ({
  usedFor,
}: {
  usedFor: "events" | "potential-friends" | "my-friends";
}) => {
  const {
    showSidebar,
    setShowSidebar,
    theme,
    displayedItems,
    setDisplayedItems,
    error,
    isLoading,
    setIsLoading,
    fetchStart,
    setFetchStart,
  } = useMainContext();
  const { currentUser, userCreatedAccount, logout } = useUserContext();
  const { setCurrentEvent } = useEventContext();

  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

  const toggleShowFilterOptions = (): void => setShowFilterOptions(!showFilterOptions);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const getFetchLimit = (): number => {
    if (usedFor === "potential-friends" || usedFor === "my-friends") {
      return 9;
    }
    return 8;
  };
  const fetchLimit: number = getFetchLimit();

  const [activeFilters, setActiveFilters] = useState<TDisplayedCardsFilter[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [searchBoxIsFocused, setSearchBoxIsFocused] = useState<boolean>(false);
  const searchBoxRef = useRef<HTMLInputElement | null>(null);

  // Maybe provide btn in case of fetch error that calls getPotentialFriends again.
  const [fetchError, setFetchError] = useState<string>("");

  if (error) {
    throw new Error(error);
  }

  const [allPotentialFriends, setAllPotentialFriends] = useState<TBarebonesUser[]>([]);
  const [allFriends, setAllFriends] = useState<TBarebonesUser[]>([]);
  const [allExplorableEvents, setAllExplorableEvents] = useState<TEvent[]>([]);

  const initializePotentialFriendsSearch = (input: string) => {
    setIsLoading(true);
    setFetchStart(0);
    if (currentUser) {
      Requests.getPotentialFriends(currentUser, 0, Infinity)
        .then((batchOfPotentialFriends) => {
          if (batchOfPotentialFriends) {
            setAllPotentialFriends(
              batchOfPotentialFriends.map((pf) => Methods.getTBarebonesUser(pf))
            );
            setDisplayedItems(
              batchOfPotentialFriends.filter((pf) => {
                // loop thru all items in pf.interests; if one includes input, return pf
                const getAnInterestIncludesSearchTerm = (): boolean => {
                  for (const interest of pf.interests) {
                    if (interest.includes(input.toLowerCase())) {
                      return true;
                    }
                  }
                  return false;
                };
                const anInterestIncludesSearchTerm: boolean =
                  getAnInterestIncludesSearchTerm();

                if (
                  pf.firstName?.toLowerCase().includes(input.toLowerCase()) ||
                  pf.lastName?.toLowerCase().includes(input.toLowerCase()) ||
                  pf.username?.toLowerCase().includes(input.toLowerCase()) ||
                  anInterestIncludesSearchTerm
                ) {
                  return Methods.getTUserSecureFromTUser(pf, currentUser);
                }
              })
            );
          } else {
            setFetchError("Could not load potential friends. Try reloading the page.");
          }
        })
        .catch((error) => {
          setFetchError("Could not fetch potential friends. Try reloading the page.");
          console.log(error);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const initializePotentialFriendsFilter = (filters: TDisplayedCardsFilter[]) => {
    setIsLoading(true);
    setFetchStart(0);
    if (currentUser) {
      Requests.getPotentialFriends(currentUser, 0, Infinity)
        .then((batchOfPotentialFriends) => {
          if (batchOfPotentialFriends) {
            setAllPotentialFriends(
              batchOfPotentialFriends.map((pf) => Methods.getTBarebonesUser(pf))
            );
            let matches: TUserSecure[] = [];
            for (const pf of batchOfPotentialFriends) {
              if (pf._id) {
                for (const filter of filters) {
                  const currentUserIsFriend =
                    currentUser && currentUser._id
                      ? pf.friends.includes(currentUser._id.toString())
                      : false;

                  const currentUserIsFriendOfFriend: boolean = pf.friends.some(
                    (pfFriend) => {
                      if (currentUser && currentUser.friends.includes(pfFriend)) {
                        return true;
                      }
                      return false;
                    }
                  );

                  const currentUserMaySeeLocation: boolean =
                    pf.whoCanSeeLocation === "anyone" ||
                    (pf.whoCanSeeLocation === "friends" && currentUserIsFriend) ||
                    (pf.whoCanSeeLocation === "friends of friends" &&
                      (currentUserIsFriendOfFriend || currentUserIsFriend));

                  if (filter === "in my city") {
                    if (
                      currentUserMaySeeLocation &&
                      pf.city === currentUser?.city &&
                      pf.stateProvince === currentUser?.stateProvince &&
                      pf.country === currentUser?.country
                    ) {
                      if (
                        !matches.includes(
                          Methods.getTUserSecureFromTUser(pf, currentUser)
                        )
                      ) {
                        matches.push(Methods.getTUserSecureFromTUser(pf, currentUser));
                      }
                    }
                  }

                  if (filter === "in my state") {
                    if (
                      currentUserMaySeeLocation &&
                      pf.stateProvince === currentUser?.stateProvince &&
                      pf.country === currentUser?.country
                    ) {
                      if (
                        !matches.includes(
                          Methods.getTUserSecureFromTUser(pf, currentUser)
                        )
                      ) {
                        matches.push(Methods.getTUserSecureFromTUser(pf, currentUser));
                      }
                    }
                  }

                  if (filter === "in my country") {
                    if (
                      currentUserMaySeeLocation &&
                      pf.country === currentUser?.country
                    ) {
                      if (
                        !matches.includes(
                          Methods.getTUserSecureFromTUser(pf, currentUser)
                        )
                      ) {
                        matches.push(Methods.getTUserSecureFromTUser(pf, currentUser));
                      }
                    }
                  }

                  if (
                    filter === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend)
                  ) {
                    if (
                      !matches.includes(Methods.getTUserSecureFromTUser(pf, currentUser))
                    ) {
                      matches.push(Methods.getTUserSecureFromTUser(pf, currentUser));
                    }
                  }

                  if (filter === "common interests") {
                    if (currentUser && currentUser.interests) {
                      for (const interest of currentUser?.interests) {
                        if (pf.interests.includes(interest)) {
                          if (
                            !matches.includes(
                              Methods.getTUserSecureFromTUser(pf, currentUser)
                            )
                          ) {
                            matches.push(
                              Methods.getTUserSecureFromTUser(pf, currentUser)
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            setDisplayedItems(matches);
          } else {
            setFetchError("Could not load potential friends. Try reloading the page.");
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
    }
  };

  const initializeFriendsSearch = (input: string) => {
    setIsLoading(true);
    setFetchStart(0);
    if (currentUser) {
      Requests.getFriends(currentUser, 0, Infinity)
        .then((batchOfFriends) => {
          if (batchOfFriends) {
            setAllFriends(batchOfFriends.map((f) => Methods.getTBarebonesUser(f)));
            setDisplayedItems(
              batchOfFriends.filter((f) => {
                const getAnInterestIncludesSearchTerm = (): boolean => {
                  for (const interest of f.interests) {
                    if (interest.includes(input.toLowerCase())) {
                      return true;
                    }
                  }
                  return false;
                };
                const anInterestIncludesSearchTerm: boolean =
                  getAnInterestIncludesSearchTerm();

                if (
                  f.firstName?.toLowerCase().includes(input.toLowerCase()) ||
                  f.lastName?.toLowerCase().includes(input.toLowerCase()) ||
                  f.username?.toLowerCase().includes(input.toLowerCase()) ||
                  anInterestIncludesSearchTerm
                ) {
                  return Methods.getTUserSecureFromTUser(f, currentUser);
                }
              })
            );
          }
        })
        .catch((error) => {
          setFetchError("Could not fetch friends. Try reloading the page");
          console.log(error);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const initializeFriendsFilter = (filters: TDisplayedCardsFilter[]) => {
    setIsLoading(true);
    setFetchStart(0);
    if (currentUser) {
      Requests.getFriends(currentUser, 0, Infinity)
        .then((batchOfFriends: TUser[]) => {
          if (batchOfFriends) {
            setAllFriends(batchOfFriends.map((f) => Methods.getTBarebonesUser(f)));
            let matches: TUserSecure[] = [];
            for (const f of batchOfFriends) {
              if (f._id) {
                for (const filter of filters) {
                  const currentUserMaySeeLocation: boolean =
                    f.whoCanSeeLocation !== "nobody";

                  if (filter === "in my city") {
                    if (
                      currentUserMaySeeLocation &&
                      f.city === currentUser?.city &&
                      f.stateProvince === currentUser?.stateProvince &&
                      f.country === currentUser?.country
                    ) {
                      if (
                        !matches.includes(Methods.getTUserSecureFromTUser(f, currentUser))
                      ) {
                        matches.push(Methods.getTUserSecureFromTUser(f, currentUser));
                      }
                    }
                  }

                  if (filter === "in my state") {
                    if (
                      currentUserMaySeeLocation &&
                      f.stateProvince === currentUser?.stateProvince &&
                      f.country === currentUser?.country
                    ) {
                      if (
                        !matches.includes(Methods.getTUserSecureFromTUser(f, currentUser))
                      ) {
                        matches.push(Methods.getTUserSecureFromTUser(f, currentUser));
                      }
                    }
                  }

                  if (filter === "in my country") {
                    if (currentUserMaySeeLocation && f.country === currentUser?.country) {
                      if (
                        !matches.includes(Methods.getTUserSecureFromTUser(f, currentUser))
                      ) {
                        matches.push(Methods.getTUserSecureFromTUser(f, currentUser));
                      }
                    }
                  }

                  if (filter === "common interests") {
                    if (currentUser && currentUser.interests) {
                      for (const interest of currentUser?.interests) {
                        if (f.interests.includes(interest)) {
                          if (
                            !matches.includes(
                              Methods.getTUserSecureFromTUser(f, currentUser)
                            )
                          ) {
                            matches.push(Methods.getTUserSecureFromTUser(f, currentUser));
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            setDisplayedItems(matches);
          } else {
            setFetchError("Could not load friends. Try reloading the page.");
          }
        })
        .catch((error) => {
          setFetchError("Could not fetch friends. Try reloading the page");
          console.log(error);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const initializeEventsSearch = (input: string) => {
    setIsLoading(true);
    setFetchStart(0);
    if (currentUser) {
      Requests.getExplorableEvents(currentUser, 0, Infinity)
        .then((batchOfEvents: TEvent[]) => {
          if (batchOfEvents) {
            setAllExplorableEvents(batchOfEvents);
            setDisplayedItems(
              batchOfEvents.filter((event) => {
                let isInterestMatch: boolean = false;
                for (const interest of event.relatedInterests) {
                  if (interest.includes(input.toLowerCase())) {
                    isInterestMatch = true;
                  }
                }

                if (
                  event.title.toLowerCase().includes(input.toLowerCase()) ||
                  event.additionalInfo.toLowerCase().includes(input.toLowerCase()) ||
                  event.address?.toLowerCase().includes(input.toLowerCase()) ||
                  event.city?.toLowerCase().includes(input.toLowerCase()) ||
                  event.country?.toLowerCase().includes(input.toLowerCase()) ||
                  event.description.toLowerCase().includes(input.toLowerCase()) ||
                  isInterestMatch ||
                  event.stateProvince?.toLowerCase().includes(input.toLowerCase())
                ) {
                  return event;
                }
              })
            );
          } else {
            setFetchError("Could not load events. Try reloading the page.");
          }
        })
        .catch((error) => {
          setFetchError("Could not fetch events. Try reloading the page.");
          console.log(error);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const initializeEventsFilter = (filters: TDisplayedCardsFilter[]) => {
    setIsLoading(true);
    setFetchStart(0);
    if (currentUser) {
      Requests.getExplorableEvents(currentUser, 0, Infinity)
        .then((batchOfEvents: TEvent[]) => {
          if (batchOfEvents) {
            setAllExplorableEvents(batchOfEvents);
            let matches: TEvent[] = [];
            for (const ev of batchOfEvents) {
              for (const filter of filters) {
                if (filter === "in my city") {
                  if (
                    currentUser &&
                    ev.city === currentUser.city &&
                    matches.indexOf(ev) === -1
                  ) {
                    matches.push(ev);
                  }
                }

                if (filter === "in my state") {
                  if (
                    currentUser &&
                    ev.stateProvince === currentUser.stateProvince &&
                    matches.indexOf(ev) === -1
                  ) {
                    matches.push(ev);
                  }
                }

                if (filter === "my interests") {
                  if (
                    ev.relatedInterests.some((int) =>
                      currentUser?.interests.includes(int)
                    ) &&
                    matches.indexOf(ev) === -1
                  ) {
                    matches.push(ev);
                  }
                }

                if (filter === "organized by friends") {
                  if (
                    ev.organizers.some((o) => {
                      if (o) {
                        return currentUser?.friends.includes(o.toString());
                      }
                    }) &&
                    matches.indexOf(ev) === -1
                  ) {
                    matches.push(ev);
                  }
                }

                if (filter === "RSVP'd by friends") {
                  if (
                    ev.interestedUsers.some((iu) => {
                      if (iu) {
                        return currentUser?.friends.includes(iu.toString());
                      }
                    }) &&
                    matches.indexOf(ev) === -1
                  ) {
                    matches.push(ev);
                  }
                }
              }
            }
            setDisplayedItems(matches);
          } else {
            setFetchError("Could not load events. Try reloading the page.");
          }
        })
        .catch((error) => {
          setFetchError("Could not fetch events. Try reloading the page.");
          console.log(error);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const handleLoadMoreItemsOnScroll = (
    items: (TUserSecure | TEvent | TBarebonesUser)[],
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

    if (bottomReached) {
      const lastItem: TUserSecure | TEvent | TBarebonesUser = items[items.length - 1];

      if (
        lastItem &&
        lastItem.index &&
        searchTerm === "" &&
        !displayedItems
          .map((i) => i.index)
          .some((i) => {
            if (lastItem.index) {
              return i === lastItem.index + 1;
            }
          })
      ) {
        setFetchStart(lastItem.index + 1);
      }
    }
  };

  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }

    if (fetchStart !== 0) {
      setFetchStart(0);
    }

    setIsLoading(true);

    if (searchTerm !== "") {
      setSearchTerm("");
    }

    if (activeFilters.length !== 0) {
      setActiveFilters([]);
    }

    if (showFilterOptions) {
      setShowFilterOptions(false);
    }
  }, [usedFor]);

  useEffect(() => {
    if (usedFor === "potential-friends") {
      // Initialize displayedItems:
      if (searchTerm === "" && activeFilters.length === 0) {
        if (!isLoading) {
          setIsLoading(true);
        }
        if (fetchLimit && currentUser) {
          Requests.getPotentialFriends(currentUser, fetchStart, fetchLimit)
            .then((batchOfPotentialFriends) => {
              if (batchOfPotentialFriends) {
                if (fetchStart === 0) {
                  setDisplayedItems(
                    batchOfPotentialFriends.map((pf) =>
                      Methods.getTUserSecureFromTUser(pf, currentUser)
                    )
                  );
                } else {
                  setDisplayedItems(
                    displayedItems.concat(
                      batchOfPotentialFriends.map((pf) =>
                        Methods.getTUserSecureFromTUser(pf, currentUser)
                      )
                    )
                  );
                }
                // If no search input, add handler to scroll, increasing fetchStart; if not, try removing it:
                if (searchTerm === "") {
                  // scroll handler needs to be called w/ updated potentialFriends
                  window.addEventListener("scroll", () => {
                    if (displayedItems.every((item) => Methods.isTUserSecure(item))) {
                      handleLoadMoreItemsOnScroll(
                        displayedItems.concat(batchOfPotentialFriends)
                      );
                    }
                  });
                } else {
                  window.removeEventListener("scroll", () => {
                    if (displayedItems.every((item) => Methods.isTUserSecure(item))) {
                      handleLoadMoreItemsOnScroll(
                        displayedItems.concat(batchOfPotentialFriends)
                      );
                    }
                  });
                }
              } else {
                setFetchError(
                  "Could not load potential friends. Try reloading the page."
                );
              }
            })
            .catch((error) => {
              setFetchError("Could not fetch potential friends. Try reloading the page.");
              console.log(error);
            })
            .finally(() => setIsLoading(false));
        }
      }
    }

    if (usedFor === "my-friends") {
      if (searchTerm === "" && activeFilters.length === 0) {
        if (!isLoading) {
          setIsLoading(true);
        }
        if (fetchLimit && currentUser) {
          Requests.getFriends(currentUser, fetchStart, fetchLimit)
            .then((batchOfFriends: TUser[]) => {
              if (batchOfFriends) {
                if (fetchStart === 0) {
                  setDisplayedItems(
                    batchOfFriends.map((f) =>
                      Methods.getTUserSecureFromTUser(f, currentUser)
                    )
                  );
                } else {
                  setDisplayedItems(
                    displayedItems.concat(
                      batchOfFriends.map((f) =>
                        Methods.getTUserSecureFromTUser(f, currentUser)
                      )
                    )
                  );
                }

                if (searchTerm === "") {
                  // scroll handler needs to be called w/ updated potentialFriends
                  window.addEventListener("scroll", () => {
                    if (displayedItems.every((item) => Methods.isTUserSecure(item))) {
                      handleLoadMoreItemsOnScroll(displayedItems.concat(batchOfFriends));
                    }
                  });
                } else {
                  window.removeEventListener("scroll", () => {
                    if (displayedItems.every((item) => Methods.isTUserSecure(item))) {
                      handleLoadMoreItemsOnScroll(displayedItems.concat(batchOfFriends));
                    }
                  });
                }
              } else {
                setFetchError("Could not load friends. Try reloading the page.");
              }
            })
            .catch((error) => {
              setFetchError("Could not fetch friends. Try reloading the page");
              console.log(error);
            })
            .finally(() => setIsLoading(false));
        }
      }
    }

    if (usedFor === "events") {
      if (searchTerm === "" && activeFilters.length === 0) {
        if (!isLoading) {
          setIsLoading(true);
        }
        if (fetchLimit && currentUser) {
          Requests.getExplorableEvents(currentUser, fetchStart, fetchLimit)
            .then((batchOfEvents: TEvent[]) => {
              if (batchOfEvents) {
                if (fetchStart === 0) {
                  setDisplayedItems(batchOfEvents);
                } else {
                  setDisplayedItems(displayedItems.concat(batchOfEvents));
                }

                if (searchTerm === "") {
                  window.addEventListener("scroll", () => {
                    handleLoadMoreItemsOnScroll(displayedItems.concat(batchOfEvents));
                  });
                } else {
                  window.removeEventListener("scroll", () => {
                    handleLoadMoreItemsOnScroll(displayedItems.concat(batchOfEvents));
                  });
                }
              } else {
                setFetchError("Could not load events. Try reloading the page.");
              }
            })
            .catch((error) => {
              setFetchError("Could not fetch events. Try reloading the page.");
              console.log(error);
            })
            .finally(() => setIsLoading(false));
        }
      }
    }
  }, [fetchStart, fetchLimit, searchTerm, usedFor, activeFilters]);

  // @ts-ignore: Must be of type TDisplayedCardsFilter[], but, the way elements are added conditionally to array results in it being type string[], since, if a condition isn't met, an iterable must be added
  const potentialFriendsFilterOptions: TDisplayedCardsFilter[] = [
    ...(currentUser?.city !== "" ? ["in my city"] : []),
    ...(currentUser?.stateProvince !== "" ? ["in my state"] : []),
    ...(currentUser?.country !== "" ? ["in my country"] : []),
    ...(currentUser?.interests.length ? ["common interests"] : []),
    ...(currentUser?.friends.length ? ["friends of friends"] : []),
  ];

  // @ts-ignore: Must be of type TDisplayedCardsFilter[], but, the way elements are added conditionally to array results in it being type string[], since, if a condition isn't met, an iterable must be added
  const friendsFilterOptions: TDisplayedCardsFilter[] = [
    ...(currentUser?.city !== "" ? ["in my city"] : []),
    ...(currentUser?.stateProvince !== "" ? ["in my state"] : []),
    ...(currentUser?.country !== "" ? ["in my country"] : []),
    ...(currentUser?.interests.length ? ["common interests"] : []),
  ];

  // @ts-ignore: Must be of type TDisplayedCardsFilter[], but, the way elements are added conditionally to array results in it being type string[], since, if a condition isn't met, an iterable must be added
  const eventFilterOptions: TDisplayedCardsFilter[] = [
    ...(currentUser?.city !== "" ? ["in my city"] : []),
    ...(currentUser?.stateProvince !== "" ? ["in my state"] : []),
    ...(currentUser?.country !== "" ? ["in my country"] : []),
    ...(currentUser?.interests.length ? ["my interests"] : []),
    ...(currentUser?.friends.length ? ["organized by friends"] : []),
    ...(currentUser?.friends.length ? ["RSVP'd by friends"] : []),
  ];

  const getFilterOptions = (): TDisplayedCardsFilter[] => {
    if (usedFor === "potential-friends") {
      return potentialFriendsFilterOptions;
    } else if (usedFor === "my-friends") {
      return friendsFilterOptions;
    }
    return eventFilterOptions;
  };
  const filterOptions = getFilterOptions();

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      logout();
      setCurrentEvent(undefined);
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  }, [currentUser, navigation, userCreatedAccount]);

  // HANDLERS
  const handleAddDeleteFilter = (option: TDisplayedCardsFilter): void => {
    setSearchTerm("");
    // If activeFilters includes option, delete it from activeFilters and vice versa:
    const updatedActiveFiltersArray: TDisplayedCardsFilter[] = activeFilters.includes(
      option
    )
      ? activeFilters.filter((o) => o !== option)
      : activeFilters.concat(option);
    setActiveFilters(updatedActiveFiltersArray);

    if (updatedActiveFiltersArray.length > 0) {
      if (usedFor === "events") {
        initializeEventsFilter(updatedActiveFiltersArray);
      }

      if (usedFor === "potential-friends") {
        initializePotentialFriendsFilter(updatedActiveFiltersArray);
      }

      if (usedFor === "my-friends") {
        initializeFriendsFilter(updatedActiveFiltersArray);
      }
    } else {
      // Reset displayedItems if there are no longer any active filters:
      if (usedFor === "events") {
        setFetchStart(0);
        setAllExplorableEvents([]);
      }
      if (usedFor === "my-friends") {
        setFetchStart(0);
        setAllFriends([]);
      }
      if (usedFor === "potential-friends") {
        setFetchStart(0);
        setAllPotentialFriends([]);
      }
    }
  };

  const handleClearActiveFilters = (): void => {
    setActiveFilters([]);
    if (usedFor === "events") {
      setFetchStart(0);
      setAllExplorableEvents([]);
    }
    if (usedFor === "my-friends") {
      setFetchStart(0);
      setAllFriends([]);
    }
    if (usedFor === "potential-friends") {
      setFetchStart(0);
      setAllPotentialFriends([]);
    }
  };

  const handleSearchTermInput = (input: string): void => {
    if (activeFilters.length > 0) {
      setActiveFilters([]);
    }

    const inputCleaned = input.replace(/\s+/g, " ");
    setSearchTerm(inputCleaned);

    if (inputCleaned.trim() !== "") {
      if (usedFor === "events") {
        if (allExplorableEvents.length === 0) {
          initializeEventsSearch(inputCleaned.trim());
        } else {
          setDisplayedItems(
            allExplorableEvents.filter((ee: TEvent) => {
              let isInterestMatch: boolean = false;
              for (const interest of ee.relatedInterests) {
                if (interest.includes(inputCleaned.toLowerCase())) {
                  isInterestMatch = true;
                }
              }

              if (
                ee.title.toLowerCase().includes(inputCleaned.toLowerCase()) ||
                ee.additionalInfo.toLowerCase().includes(inputCleaned.toLowerCase()) ||
                ee.address?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
                ee.city?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
                ee.country?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
                ee.description.toLowerCase().includes(inputCleaned.toLowerCase()) ||
                isInterestMatch ||
                ee.stateProvince?.toLowerCase().includes(inputCleaned.toLowerCase())
              ) {
                return ee;
              }
            })
          );
        }
      }

      if (usedFor === "potential-friends") {
        if (allPotentialFriends.length === 0) {
          initializePotentialFriendsSearch(inputCleaned.trim());
        } else {
          setDisplayedItems(
            allPotentialFriends.filter((pf) => {
              // loop thru all items in pf.interests; if one includes input, return pf
              if (
                pf.firstName?.toLowerCase().includes(input.toLowerCase()) ||
                pf.lastName?.toLowerCase().includes(input.toLowerCase()) ||
                pf.username?.toLowerCase().includes(input.toLowerCase())
              ) {
                return pf;
              }
            })
          );
        }
      }

      if (usedFor === "my-friends") {
        if (allFriends.length === 0) {
          initializeFriendsSearch(inputCleaned.trim());
        } else {
          setDisplayedItems(
            allFriends.filter((f) => {
              // loop thru all items in pf.interests; if one includes input, return pf
              if (
                f.firstName?.toLowerCase().includes(input.toLowerCase()) ||
                f.lastName?.toLowerCase().includes(input.toLowerCase()) ||
                f.username?.toLowerCase().includes(input.toLowerCase())
              ) {
                return f;
              }
            })
          );
        }
      }
    } else {
      if (usedFor === "events") {
        setDisplayedItems([]);
        setAllExplorableEvents([]);
        setFetchStart(0);
      }
      if (usedFor === "potential-friends") {
        setDisplayedItems([]);
        setAllPotentialFriends([]);
        setFetchStart(0);
      }
      if (usedFor === "my-friends") {
        setDisplayedItems([]);
        setAllFriends([]);
        setFetchStart(0);
      }
    }
  };

  const handleClearSearchTerm = (): void => {
    setDisplayedItems([]);
    setSearchTerm("");
    setFetchStart(0);

    if (usedFor === "events") {
      setAllExplorableEvents([]);
    }
    if (usedFor === "my-friends") {
      setAllFriends([]);
    }
    if (usedFor === "potential-friends") {
      setAllPotentialFriends([]);
    }
  };

  const getPageHeading = (): string => {
    if (usedFor === "events") {
      return "Events";
    } else if (usedFor === "potential-friends") {
      return "Find Palz";
    }
    return "My Palz";
  };
  const pageHeading: string = getPageHeading();

  const isNoFetchError: boolean = fetchError === "";

  return (
    <>
      <h1>{pageHeading}</h1>
      {!isLoading &&
        isNoFetchError &&
        displayedItems.length === 0 &&
        usedFor === "potential-friends" &&
        searchTerm === "" &&
        activeFilters.length === 0 && (
          <h2>No more potential friends. You must be popular!</h2>
        )}
      {isNoFetchError &&
        !isLoading &&
        displayedItems.length === 0 &&
        usedFor === "my-friends" &&
        searchTerm === "" &&
        activeFilters.length === 0 && (
          <h2>
            No friends yet. Click{" "}
            <Link
              style={{
                textDecoration: "underline",
                color: "var(--header-one-color)",
                fontWeight: "bold",
              }}
              to="/find-palz"
            >
              here
            </Link>{" "}
            to find some!
          </h2>
        )}
      {!isLoading &&
        isNoFetchError &&
        displayedItems.length === 0 &&
        usedFor === "events" &&
        searchTerm === "" &&
        activeFilters.length === 0 && (
          <h2>
            No events to be found.{" "}
            <Link
              style={{
                textDecoration: "underline",
                color: "var(--header-one-color)",
                fontWeight: "bold",
              }}
              to={"/add-event"}
            >
              Create your own
            </Link>{" "}
            or wait for others to do so.
          </h2>
        )}
      {isNoFetchError &&
        (displayedItems.length > 0 ||
          (displayedItems.length === 0 && searchTerm !== "") ||
          (displayedItems.length === 0 && activeFilters.length > 0)) && (
          <search className="search-tools-container">
            <SearchBar
              input={searchTerm}
              placeholder={
                usedFor === "events"
                  ? "Search events"
                  : usedFor === "potential-friends"
                  ? "Search potential palz by first/last name, interests"
                  : "Search palz by first/last name, interests"
              }
              inputHandler={handleSearchTermInput}
              clearInputHandler={handleClearSearchTerm}
              isSideButton={false}
              title={
                usedFor === "events"
                  ? "Search by title, organizers, description, related interests, or location"
                  : "Search by first/last name, or username"
              }
              searchBoxRef={searchBoxRef}
              setSearchBoxIsFocused={setSearchBoxIsFocused}
              searchBoxIsFocused={searchBoxIsFocused}
              randomColor={randomColor}
              numberOfResults={displayedItems.length}
            />
            <FilterDropdown
              dropdownBtnText="Filters"
              filterOptions={filterOptions}
              activeFilters={activeFilters}
              handleAddDeleteFilter={handleAddDeleteFilter}
              showFilterOptions={showFilterOptions}
              toggleShowFilterOptions={toggleShowFilterOptions}
              handleClearActiveFilters={handleClearActiveFilters}
              randomColor={randomColor}
            />
          </search>
        )}
      {isNoFetchError && (
        <>
          <div className="all-cards-container">
            {usedFor === "events" &&
              displayedItems.every((event) => Methods.isTEvent(event)) &&
              Methods.removeDuplicatesFromArray(displayedItems).map(
                (item) =>
                  Methods.isTEvent(item) && <EventCard key={item._id} event={item} />
              )}
            {usedFor === "my-friends" &&
              Methods.removeDuplicatesFromArray(displayedItems).map(
                (item) =>
                  Methods.isTUser(item) &&
                  item &&
                  item._id && <UserCard key={item._id.toString()} userSECURE={item} />
              )}
            {usedFor === "potential-friends" &&
              Methods.removeDuplicatesFromArray(displayedItems).map(
                (item) =>
                  Methods.isTUser(item) &&
                  item &&
                  item._id && <UserCard key={item._id.toString()} userSECURE={item} />
              )}
          </div>
        </>
      )}
      {fetchError && <p>{fetchError}</p>}
      {isLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
    </>
  );
};

export default DisplayedCardsPage;
