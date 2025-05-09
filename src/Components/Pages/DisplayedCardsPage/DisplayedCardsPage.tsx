import { useEffect, useRef, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate, Link } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import UserCard from "../../Elements/UserCard/UserCard";
import Methods from "../../../methods";
import { TEvent, TThemeColor, TUser, TOtherUser } from "../../../types";
import FilterDropdown from "../../Elements/FilterDropdown/FilterDropdown";
import SearchBar from "../../Elements/SearchBar/SearchBar";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";
import Requests from "../../../requests";

const DisplayedCardsPage = ({
  usedFor,
}: {
  usedFor: "events" | "potential-friends" | "my-friends";
}) => {
  const {
    showSidebar,
    setShowSidebar,
    theme,
    setDisplayedItemsCount,
    displayedItems,
    setDisplayedItems,
    setDisplayedItemsCountInterval,
    displayedItemsFiltered,
  } = useMainContext();
  const {
    currentUser,
    userCreatedAccount,
    blockedUsers,
    logout,
    friends,
    fetchAllVisibleOtherUsersQuery,
  } = useUserContext();

  const visibleOtherUsers: TOtherUser[] | undefined = fetchAllVisibleOtherUsersQuery.data;

  const { fetchAllEventsQuery } = useEventContext();

  const allEvents: TEvent[] | undefined = fetchAllEventsQuery.data;

  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  const toggleShowFilterOptions = (): void => setShowFilterOptions(!showFilterOptions);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

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
    if (usedFor === "potential-friends") {
      setDisplayedItemsCount(9);
      setDisplayedItemsCountInterval(9);
      resetDisplayedPotentialFriends();
    }

    if (usedFor === "my-friends") {
      setDisplayedItemsCount(9);
      setDisplayedItemsCountInterval(9);
      resetDisplayedFriends();
    }

    if (usedFor === "events") {
      setDisplayedItemsCount(8);
      setDisplayedItemsCountInterval(8);
      resetDisplayedEvents();
    }

    if (showSidebar) {
      setShowSidebar(false);
    }

    if (searchTerm !== "") {
      setSearchTerm("");
    }

    if (activeFilters.length !== 0) {
      setActiveFilters([]);
    }

    if (showFilterOptions) {
      setShowFilterOptions(false);
    }
  }, [fetchAllVisibleOtherUsersQuery.isLoading, usedFor]);

  const now = Date.now();

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [searchBoxIsFocused, setSearchBoxIsFocused] = useState<boolean>(false);
  const searchBoxRef = useRef<HTMLInputElement | null>(null);

  // Re-render page as changes (for now, RSVPs) are made to events in allEvents, taking into account any existing search term or filter
  /* Before, when RSVPing/de-RSVPing, RSVP button text wasn't updating properly b/c component didn't have access to updated events in allEvents (which were updating properly) until a page refresh, but now, this UI will hot update b/c of functionality in a useEffect that updates displayedEvents that depends on allEvents. UI would not update properly if this functionality were inside a useEffect w/ an empty dependency array. */
  useEffect(() => {
    if (usedFor === "events") {
      if (searchTerm.trim() !== "") {
        let newDisplayedEvents: TEvent[] = [];

        const allPublicEventsThatStartOrEndInFuture: TEvent[] | undefined =
          allEvents?.filter(
            (event) =>
              (event.eventStartDateTimeInMS > now || event.eventEndDateTimeInMS > now) &&
              event.publicity === "public"
          );

        if (allPublicEventsThatStartOrEndInFuture) {
          for (const event of allPublicEventsThatStartOrEndInFuture) {
            // Get arrays of organizer full names & usernames so they are searchable (need to look up user by id):
            let eventOrganizerNames: string[] = [];
            let eventOrganizerUsernames: string[] = [];
            for (const id of event.organizers) {
              const matchingUser: TOtherUser | undefined = visibleOtherUsers?.filter(
                (user) => user?._id === id
              )[0];

              const fullName: string = `${matchingUser?.firstName?.toLowerCase()} ${matchingUser?.lastName?.toLowerCase()}`;
              eventOrganizerNames.push(fullName);

              if (matchingUser?.username) {
                eventOrganizerUsernames.push(matchingUser.username);
              }
            }
            let isOrganizerNameMatch: boolean = false;
            for (const name of eventOrganizerNames) {
              if (name.includes(searchTerm.toLowerCase())) {
                isOrganizerNameMatch = true;
              }
            }

            let isUsernameMatch: boolean = false;
            for (const username of eventOrganizerUsernames) {
              if (username.includes(searchTerm.toLowerCase())) {
                isUsernameMatch = true;
              }
            }

            if (
              event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.additionalInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              isOrganizerNameMatch ||
              isUsernameMatch ||
              event.stateProvince?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              newDisplayedEvents.push(event);
            }
          }
        }
        setDisplayedItems(newDisplayedEvents);
      } else if (activeFilters.length > 0) {
        let newDisplayedEvents: TEvent[] = [];
        for (const filter of activeFilters) {
          const indexOfArrayInFilterOptions =
            Object.keys(eventFilterOptions).indexOf(filter);
          const filterOptionEvents: TEvent[] =
            Object.values(eventFilterOptions)[indexOfArrayInFilterOptions];

          for (const filterOptionEvent of filterOptionEvents) {
            if (
              !newDisplayedEvents.map((ev) => ev._id).includes(filterOptionEvent?._id)
            ) {
              newDisplayedEvents.push(filterOptionEvent);
            }
          }
        }
        setDisplayedItems(newDisplayedEvents);
      } else {
        resetDisplayedEvents();
      }
    }
  }, [allEvents]);

  // EVENTS VARIABLES
  const displayableEvents: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      (event.eventStartDateTimeInMS > now || event.eventEndDateTimeInMS > now) &&
      (event.publicity === "public" ||
        (currentUser?._id &&
          (event.invitees.includes(currentUser._id) ||
            event.organizers.includes(currentUser._id))))
  );

  const getEventsByCurrentUserInterests = (): TEvent[] => {
    let eventsByCurrentUserInterests = [];
    const updatedDisplayedEvents = displayableEvents;
    if (currentUser?.interests && updatedDisplayedEvents) {
      for (const interest of currentUser?.interests) {
        for (const event of updatedDisplayedEvents) {
          if (event.relatedInterests.includes(interest)) {
            eventsByCurrentUserInterests.push(event);
          }
        }
      }
    }
    return eventsByCurrentUserInterests;
  };
  const eventsByCurrentUserInterests: TEvent[] = getEventsByCurrentUserInterests();

  const getEventsOrganizedByCurrentUserFriends = (): TEvent[] => {
    let eventsOrganizedByCurrentUserFriends = [];
    const updatedDisplayedEvents = displayableEvents;
    if (currentUser?.friends && updatedDisplayedEvents) {
      for (const friend of currentUser.friends) {
        for (const event of updatedDisplayedEvents) {
          if (event.organizers.includes(friend)) {
            eventsOrganizedByCurrentUserFriends.push(event);
          }
        }
      }
    }
    return eventsOrganizedByCurrentUserFriends;
  };
  const eventsOrganizedByCurrentUserFriends: TEvent[] =
    getEventsOrganizedByCurrentUserFriends();

  const getEventsRSVPdByCurrentUserFriends = (): TEvent[] => {
    let eventsRSVPdByCurrentUserFriends = [];
    const updatedDisplayedEvents = displayableEvents;
    if (currentUser?.friends && updatedDisplayedEvents) {
      for (const friend of currentUser.friends) {
        for (const event of updatedDisplayedEvents) {
          if (event.interestedUsers.includes(friend)) {
            eventsRSVPdByCurrentUserFriends.push(event);
          }
        }
      }
    }
    return eventsRSVPdByCurrentUserFriends;
  };
  const eventsRSVPdByCurrentUserFriends: TEvent[] = getEventsRSVPdByCurrentUserFriends();

  // Object containing filter options & the corresponding arrays of events
  // for pot. friends, filter by city, state, country, friends of friends, common interests. put in var potentialFriendsFilterOptions
  const eventFilterOptions = {
    ...(currentUser?.city !== "" && {
      "my city": displayableEvents?.filter((event) => event.city === currentUser?.city),
    }),
    ...(currentUser?.stateProvince !== "" && {
      "my state": displayableEvents?.filter(
        (event) => event.stateProvince === currentUser?.stateProvince
      ),
    }),
    ...(currentUser?.country !== "" && {
      "my country": displayableEvents?.filter(
        (event) => event.country === currentUser?.country
      ),
    }),
    ...(currentUser?.interests.length && {
      "my interests": eventsByCurrentUserInterests,
    }),
    ...(currentUser?.friends.length && {
      "organized by friends": eventsOrganizedByCurrentUserFriends,
    }),
    ...(currentUser?.friends.length && {
      "RSVP'd by friends": eventsRSVPdByCurrentUserFriends,
    }),
  };

  const resetDisplayedEvents = (): void => {
    if (displayableEvents) {
      setDisplayedItems(displayableEvents);
    }
  };
  //////////////////////////////////////////

  // POTENTIAL-FRIENDS VARIABLES
  const getDisplayedPotentialFriends = (): TOtherUser[] => {
    if (visibleOtherUsers && currentUser) {
      return visibleOtherUsers.filter((visibleOtherUser) => {
        if (visibleOtherUser._id) {
          return !currentUser.friends.includes(visibleOtherUser._id);
        }
      });
    }
    return [];
  };
  const displayablePotentialFriends: TOtherUser[] = getDisplayedPotentialFriends();

  const getFriendsOfFriends = (): TOtherUser[] => {
    // First, fetch TUser object for each currentUser friend
    // Then, map array of TOtherUser from visibleOtherUsers based on friend id
    if (currentUser && visibleOtherUsers) {
      for (const currentUserFriendID of currentUser.friends) {
        Requests.getUserByID(currentUserFriendID).then((res) =>
          res.json().then((currentUserFriend: TUser) => {
            return visibleOtherUsers.filter((visibleOtherUser) => {
              if (visibleOtherUser._id) {
                return currentUserFriend.friends.includes(visibleOtherUser._id);
              }
            });
          })
        );
      }
    }
    return [];
  };
  const friendsOfFriends = getFriendsOfFriends();

  const getPotentialFriendsWithCommonInterests = (): TOtherUser[] => {
    let potentialFriendsWithCommonInterests: TOtherUser[] = [];
    if (currentUser?.interests && displayablePotentialFriends) {
      for (const interest of currentUser.interests) {
        for (const potentialFriend of displayablePotentialFriends) {
          if (potentialFriend.interests.includes(interest)) {
            potentialFriendsWithCommonInterests.push(potentialFriend);
          }
        }
      }
    }
    return potentialFriendsWithCommonInterests;
  };
  const potentialFriendsWithCommonInterests = getPotentialFriendsWithCommonInterests();

  const potentialFriendFilterOptions = {
    ...(currentUser?.city !== "" && {
      "in my city": displayablePotentialFriends.filter(
        (user) => user.city === currentUser?.city
      ),
    }),
    ...(currentUser?.stateProvince !== "" && {
      "in my state": displayablePotentialFriends.filter(
        (user) => user.stateProvince === currentUser?.stateProvince
      ),
    }),
    ...(currentUser?.country !== "" && {
      "in my country": displayablePotentialFriends.filter(
        (user) => user.country === currentUser?.country
      ),
    }),
    ...(currentUser?.friends.length && {
      "friends of friends": friendsOfFriends,
    }),
    ...(currentUser?.interests.length && {
      "common interests": potentialFriendsWithCommonInterests,
    }),
  };

  const resetDisplayedPotentialFriends = (): void =>
    setDisplayedItems(displayablePotentialFriends);
  //////////////////////////////////////////////////////////////

  // FRIENDS VARIABLES
  const getCurrentUserFriends = (): TUser[] => {
    let currentUserFriends: TUser[] = [];
    if (currentUser) {
      for (const friendID of currentUser.friends) {
        Requests.getUserByID(friendID).then((res) =>
          res
            .json()
            .then((currentUserFriend: TUser) =>
              currentUserFriends.push(currentUserFriend)
            )
        );
      }
    }
    return currentUserFriends;
  };
  const currentUserFriends: TUser[] = getCurrentUserFriends();

  const friendsWithCommonInterests: TUser[] = [];
  for (const pal of currentUserFriends) {
    if (currentUser?.interests) {
      for (const interest of currentUser.interests) {
        if (pal && pal.interests.includes(interest)) {
          friendsWithCommonInterests.push(pal);
        }
      }
    }
  }
  const friendFilterOptions = {
    ...(currentUser?.city !== "" && {
      "in my city": currentUserFriends.filter((user) => user.city === currentUser?.city),
    }),
    ...(currentUser?.stateProvince !== "" && {
      "in my state": currentUserFriends.filter(
        (user) => user.stateProvince === currentUser?.stateProvince
      ),
    }),
    ...(currentUser?.country !== "" && {
      "in my country": currentUserFriends.filter(
        (user) => user.country === currentUser?.country
      ),
    }),
    ...(currentUser?.interests.length && {
      "common interests": friendsWithCommonInterests,
    }),
  };

  const resetDisplayedFriends = (): void => setDisplayedItems(currentUserFriends);

  // Upon change of friends, resetDisplayedFriends or -PotentialFriends, depending on usedFor. Account in resetDisplayedFriends for any existing filters or search terms, or clear all filters & search terms when resetting
  useEffect(() => {
    handleClearActiveFilters();
    handleClearSearchTerm();
    if (usedFor === "my-friends") {
      resetDisplayedFriends();
    }
    if (usedFor === "potential-friends") {
      resetDisplayedPotentialFriends();
    }
  }, [friends]);
  ////////////////////////////////////////////////////////////

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      logout();
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
  const handleAddDeleteFilter = (option: string): void => {
    setSearchTerm("");
    // If activeFilters includes option, delete it from activeFilters and vice versa:
    const updatedActiveFiltersArray = activeFilters.includes(option)
      ? activeFilters.filter((o) => o !== option)
      : activeFilters.concat(option);
    setActiveFilters(updatedActiveFiltersArray);

    // If at least one filter, display events that can be described by the filter(s)
    // Else, if no filters (when user clears them all), reset to all events whose start or end is in future
    if (updatedActiveFiltersArray.length > 0) {
      let newDisplayedItems: (TEvent | TOtherUser)[] = [];
      for (const filter of updatedActiveFiltersArray) {
        if (usedFor === "events") {
          const indexOfArrayInFilterOptions =
            Object.keys(eventFilterOptions).indexOf(filter);
          const filterOptionEvents: TEvent[] =
            Object.values(eventFilterOptions)[indexOfArrayInFilterOptions];

          for (const filterOptionEvent of Methods.sortEventsSoonestToLatest(
            filterOptionEvents
          )) {
            if (!newDisplayedItems.map((ev) => ev._id).includes(filterOptionEvent?._id)) {
              newDisplayedItems.push(filterOptionEvent);
            }
          }
        }

        if (usedFor === "potential-friends") {
          const indexOfArrayInFilterOptions = Object.keys(
            potentialFriendFilterOptions
          ).indexOf(filter);
          const filterOptionPotentialFriends: TOtherUser[] = Object.values(
            potentialFriendFilterOptions
          )[indexOfArrayInFilterOptions];
          for (const filterOptionPotentialFriend of filterOptionPotentialFriends) {
            if (
              !newDisplayedItems
                .map((potFriend) => potFriend._id)
                .includes(filterOptionPotentialFriend?._id)
            ) {
              newDisplayedItems.push(filterOptionPotentialFriend);
            }
          }
        }

        if (usedFor === "my-friends") {
          const indexOfArrayInFilterOptions =
            Object.keys(friendFilterOptions).indexOf(filter);
          const filterOptionFriends: TUser[] =
            Object.values(friendFilterOptions)[indexOfArrayInFilterOptions];
          for (const filterOptionFriend of filterOptionFriends) {
            if (
              !newDisplayedItems
                .map((friend) => friend._id)
                .includes(filterOptionFriend?._id)
            ) {
              newDisplayedItems.push(filterOptionFriend);
            }
          }
        }
      }
      setDisplayedItems(newDisplayedItems);
    } else {
      // Reset displayedItems if there are no longer any active filters:
      if (usedFor === "events") {
        resetDisplayedEvents();
      }
      if (usedFor === "my-friends") {
        resetDisplayedFriends();
      }
      if (usedFor === "potential-friends") {
        resetDisplayedPotentialFriends();
      }
    }
  };

  const handleClearActiveFilters = (): void => {
    setActiveFilters([]);
    if (usedFor === "events") {
      resetDisplayedEvents();
    }
    if (usedFor === "my-friends") {
      resetDisplayedFriends();
    }
    if (usedFor === "potential-friends") {
      resetDisplayedPotentialFriends();
    }
  };

  const handleSearchTermInput = (input: string): void => {
    if (activeFilters.length > 0) {
      setActiveFilters([]);
    }

    const inputCleaned = input.replace(/\s+/g, " ");
    setSearchTerm(inputCleaned);

    if (inputCleaned.trim() !== "" && displayableEvents) {
      if (usedFor === "events") {
        let newDisplayedEvents: TEvent[] = [];

        for (const event of displayableEvents) {
          // Get arrays of organizer full names & usernames so they are searchable (need to look up user by id):
          let eventOrganizerNames: string[] = [];
          let eventOrganizerUsernames: string[] = [];
          for (const id of event.organizers) {
            const matchingUser: TUser | undefined =
              allUsers && allUsers.filter((user) => user?._id === id)[0];

            const fullName: string = `${matchingUser?.firstName?.toLowerCase()} ${matchingUser?.lastName?.toLowerCase()}`;
            eventOrganizerNames.push(fullName);

            if (matchingUser?.username) {
              eventOrganizerUsernames.push(matchingUser?.username);
            }
          }
          let isOrganizerNameMatch: boolean = false;
          for (const name of eventOrganizerNames) {
            if (name.includes(inputCleaned.toLowerCase())) {
              isOrganizerNameMatch = true;
            }
          }

          let isUsernameMatch: boolean = false;
          for (const username of eventOrganizerUsernames) {
            if (username.includes(inputCleaned.toLowerCase())) {
              isUsernameMatch = true;
            }
          }

          if (
            event.title.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            event.additionalInfo.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            event.address?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            event.city?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            event.country?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            event.description.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            isOrganizerNameMatch ||
            isUsernameMatch ||
            event.stateProvince?.toLowerCase().includes(inputCleaned.toLowerCase())
          ) {
            newDisplayedEvents.push(event);
          }
        }
        setDisplayedItems(newDisplayedEvents);
      }

      if (usedFor === "potential-friends") {
        let newDisplayedPotentialFriends: TUser[] = [];
        // search pot. friends by first/last name, city/state/country, username
        for (const potentialFriend of displayablePotentialFriends) {
          if (
            potentialFriend.firstName
              ?.toLowerCase()
              .includes(inputCleaned.toLowerCase()) ||
            potentialFriend.lastName
              ?.toLowerCase()
              .includes(inputCleaned.toLowerCase()) ||
            potentialFriend.username
              ?.toLowerCase()
              .includes(inputCleaned.toLowerCase()) ||
            potentialFriend.city.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            potentialFriend.country.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            potentialFriend.stateProvince
              .toLowerCase()
              .includes(inputCleaned.toLowerCase())
          ) {
            newDisplayedPotentialFriends.push(potentialFriend);
          }
        }
        setDisplayedItems(newDisplayedPotentialFriends);
      }

      if (usedFor === "my-friends") {
        let newDisplayedFriends: TUser[] = [];
        // search pot. friends by first/last name, city/state/country, username
        for (const pal of currentUserFriends) {
          if (
            pal.firstName?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            pal.lastName?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            pal.username?.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            pal.city.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            pal.country.toLowerCase().includes(inputCleaned.toLowerCase()) ||
            pal.stateProvince.toLowerCase().includes(inputCleaned.toLowerCase())
          ) {
            newDisplayedFriends.push(pal);
          }
        }
        setDisplayedItems(newDisplayedFriends);
      }
    } else {
      if (usedFor === "events") {
        resetDisplayedEvents();
      }
      if (usedFor === "potential-friends") {
        resetDisplayedPotentialFriends();
      }
      if (usedFor === "my-friends") {
        resetDisplayedFriends();
      }
    }
  };

  const handleClearSearchTerm = (): void => {
    setSearchTerm("");
    if (usedFor === "events") {
      resetDisplayedEvents();
    }
    if (usedFor === "my-friends") {
      resetDisplayedFriends();
    }
    if (usedFor === "potential-friends") {
      resetDisplayedPotentialFriends();
    }
  };
  //////////////////////////////////////////////

  const getPageHeading = (): string => {
    if (usedFor === "events") {
      return "Events";
    } else if (usedFor === "potential-friends") {
      return "Find Palz";
    }
    return "My Palz";
  };
  const pageHeading: string = getPageHeading();

  const getFilterOptions = (): string[] => {
    if (usedFor === "events") {
      return Object.keys(eventFilterOptions);
    } else if (usedFor === "potential-friends") {
      return Object.keys(potentialFriendFilterOptions);
    }
    return Object.keys(friendFilterOptions);
  };
  const filterOptions = !fetchAllVisibleOtherUsersQuery.isLoading
    ? getFilterOptions()
    : [];

  // When used for events, both fetchAllVisibleOtherUsersQuery & fetchAllEventsQuery will have to be successful for users to be displayed
  // If used for displaying users not related to an event, only fetchAllVisibleOtherUsersQuery will have to succeed for users to be shown
  const isNoFetchError: boolean =
    usedFor === "potential-friends" || usedFor === "my-friends"
      ? !fetchAllVisibleOtherUsersQuery.isError
      : !fetchAllEventsQuery.isError && !fetchAllVisibleOtherUsersQuery.isError;

  const fetchIsLoading: boolean =
    usedFor === "potential-friends" || usedFor === "my-friends"
      ? fetchAllVisibleOtherUsersQuery.isLoading
      : fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (usedFor !== "potential-friends" && usedFor !== "my-friends") {
      if (fetchAllVisibleOtherUsersQuery.isError) {
        return fetchAllVisibleOtherUsersQuery;
      }
      return fetchAllEventsQuery;
    }
    return fetchAllVisibleOtherUsersQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  return (
    <>
      <h1>{pageHeading}</h1>
      {!fetchIsLoading &&
        isNoFetchError &&
        displayedItems.length === 0 &&
        usedFor === "potential-friends" &&
        searchTerm === "" &&
        activeFilters.length === 0 && (
          <h2>No more potential friends. You must be popular!</h2>
        )}
      {!fetchIsLoading &&
        isNoFetchError &&
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
      {!fetchIsLoading &&
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
      {!fetchIsLoading &&
        isNoFetchError &&
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
                  ? "Search potential palz"
                  : "Search palz"
              }
              inputHandler={handleSearchTermInput}
              clearInputHandler={handleClearSearchTerm}
              isSideButton={false}
              title={
                usedFor === "events"
                  ? "Search by title, organizers, description, related interests, or location"
                  : "Search by first/last name, username, or location"
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
      {!fetchIsLoading && isNoFetchError && (
        <div className="all-cards-container">
          {usedFor === "events" &&
            displayedItemsFiltered.every((event) => Methods.isTEvent(event)) &&
            Methods.removeDuplicatesFromArray(displayedItemsFiltered)
              .filter((event) =>
                currentUser && currentUser._id
                  ? !event.blockedUsersEvent.includes(currentUser._id)
                  : event
              )
              .map(
                (item) =>
                  Methods.isTEvent(item) && <EventCard key={item._id} event={item} />
              )}
          {(usedFor === "potential-friends" || usedFor === "my-friends") &&
            Methods.removeDuplicatesFromArray(displayedItemsFiltered).map(
              (item) => Methods.isTUser(item) && <UserCard key={item._id} user={item} />
            )}
        </div>
      )}
      <QueryLoadingOrError
        query={queryForQueryLoadingOrError}
        errorMessage={
          usedFor !== "events" ? "Error fetching users" : "Error fetching events"
        }
      />
    </>
  );
};

export default DisplayedCardsPage;
