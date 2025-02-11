import { useEffect, useRef, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate, Link } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import UserCard from "../../Elements/UserCard/UserCard";
import Methods from "../../../methods";
import { TEvent, TThemeColor, TUser } from "../../../types";
import FilterDropdown from "../../Elements/FilterDropdown/FilterDropdown";
import SearchBar from "../../Elements/SearchBar/SearchBar";
import toast from "react-hot-toast";
import { useEventContext } from "../../../Hooks/useEventContext";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";

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
    allUsers,
    currentUser,
    userCreatedAccount,
    blockedUsers,
    logout,
    friends,
    fetchAllUsersQuery,
  } = useUserContext();
  const { allEvents, fetchAllEventsQuery } = useEventContext();

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
  }, [fetchAllUsersQuery.isLoading, usedFor]);

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
              const matchingUser: TUser | undefined = allUsers?.filter(
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

  /* useEffect(() => {
    if (usedFor === "potential-friends") {
      let newDisplayedPotentialFriends: TUser[] = [];
      if (searchTerm.trim() !== "") {
        // search pot. friends by first/last name, city/state/country, username
        for (const potentialFriend of displayablePotentialFriends) {
          if (
            potentialFriend.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            potentialFriend.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            potentialFriend.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            potentialFriend.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            potentialFriend.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            potentialFriend.stateProvince.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            newDisplayedPotentialFriends.push(potentialFriend);
          }
        }
        setDisplayedItems(newDisplayedPotentialFriends);
      } else if (activeFilters.length > 0) {
        for (const filter of activeFilters) {
          const indexOfArrayInFilterOptions = Object.keys(
            potentialFriendFilterOptions
          ).indexOf(filter);
          const filterOptionPotentialFriends: TUser[] = Object.values(
            potentialFriendFilterOptions
          )[indexOfArrayInFilterOptions];
          for (const filterOptionPotentialFriend of filterOptionPotentialFriends) {
            if (
              !newDisplayedPotentialFriends
                .map((potFriend) => potFriend._id)
                .includes(filterOptionPotentialFriend?._id)
            ) {
              newDisplayedPotentialFriends.push(filterOptionPotentialFriend);
            }
          }
        }
      }
    }

    if (usedFor === "my-friends") {
      let newDisplayedFriends: TUser[] = [];

      if (searchTerm !== "") {
        for (const pal of currentUserPalz) {
          if (
            pal.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pal.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pal.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pal.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pal.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pal.stateProvince.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            newDisplayedFriends.push(pal);
          }
        }
        setDisplayedItems(newDisplayedFriends);
      } else if (activeFilters.length > 0) {
        for (const filter of activeFilters) {
          const indexOfArrayInFilterOptions =
            Object.keys(friendFilterOptions).indexOf(filter);
          const filterOptionFriends: TUser[] =
            Object.values(friendFilterOptions)[indexOfArrayInFilterOptions];
          for (const filterOptionFriend of filterOptionFriends) {
            if (
              !newDisplayedFriends
                .map((friend) => friend._id)
                .includes(filterOptionFriend._id)
            ) {
              newDisplayedFriends.push(filterOptionFriend);
            }
          }
        }
      }
    }
  }, [allUsers]); */

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
  /* display only users whose profile is visible to anyone, to friends & currentUser is friend, and friends of friends & currentUser is a friend of a user's friend, and who hasn't blocked currentUser, and whom currentUser hasn't blocked. */
  const allOtherNonFriendUsers: TUser[] | undefined = allUsers?.filter(
    (user) =>
      currentUser?._id &&
      user._id &&
      user._id !== currentUser._id &&
      !friends?.includes(user._id) &&
      !user.blockedUsers.includes(currentUser._id) &&
      !blockedUsers?.includes(user._id)
  );

  const nonFriendUsersVisibleToAnyone: TUser[] | undefined =
    allOtherNonFriendUsers?.filter((user) => user.profileVisibleTo === "anyone");

  const nonFriendUsersVisibleToFriendsOfFriends: TUser[] | undefined =
    allOtherNonFriendUsers?.filter(
      (user) => user.profileVisibleTo === "friends of friends"
    );

  /* Function to return for display an array of users whose profiles are visible to anyone, or to friends of friends & currentUser is a friend of a friend */
  const getDisplayablePotentialFriends = (): TUser[] => {
    let displayablePotentialFriends = nonFriendUsersVisibleToAnyone;

    if (
      nonFriendUsersVisibleToFriendsOfFriends &&
      allUsers &&
      displayablePotentialFriends
    ) {
      for (const user of nonFriendUsersVisibleToFriendsOfFriends) {
        // for each friend of user, check if their friends arr includes currentUser._id
        // will need to get TUser of friend, not just id
        const userFriends: TUser[] = []; // array of user's friends in TUser form
        // Push user in allUsers w/ id that matches friendID into userFriends
        for (const friendID of user.friends) {
          userFriends.push(allUsers.filter((u) => u._id === friendID)[0]);
        }
        /* for every friend of userFriends, check if their friends list includes currentUser._id & push to displayablePotentialFriends if it does */
        for (const friend of userFriends) {
          if (currentUser?._id && friend.friends.includes(currentUser._id)) {
            displayablePotentialFriends.push(friend);
          }
        }
      }
      return displayablePotentialFriends;
    }
    return [];
  };
  const displayablePotentialFriends = getDisplayablePotentialFriends();

  const getFriendsOfFriends = (): TUser[] => {
    // get TUser object that matches each id in currentUser.friends:
    let currentUserFriends: TUser[] = [];
    if (currentUser?.friends && allUsers) {
      for (const friendID of currentUser.friends) {
        currentUserFriends.push(allUsers.filter((u) => u._id === friendID)[0]);
      }
    }
    // get TUser object that matches each id in friends array of each of currentUser's friends
    let friendsOfFriends: TUser[] = [];
    for (const friend of currentUserFriends) {
      if (friend && friend.friends.length > 0 && allUsers) {
        for (const friendID of friend.friends) {
          const friendOfFriend: TUser | undefined = allUsers.filter(
            (u) =>
              friendID !== currentUser?._id &&
              !currentUser?.friends.includes(friendID) &&
              u._id === friendID
          )[0];
          /* Necessary to check that friendOfFriend is truthy b/c it would sometimes be undefined if no user in allUsers fit the criteria (without this check, undefined would be pushed to friendsOfFriends) */
          if (friendOfFriend) {
            friendsOfFriends.push(friendOfFriend);
          }
        }
      }
    }
    return friendsOfFriends;
  };
  const friendsOfFriends = getFriendsOfFriends();

  const getPotentialFriendsWithCommonInterests = (): TUser[] => {
    let potentialFriendsWithCommonInterests: TUser[] = [];
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
  const currentUserPalz: TUser[] = [];
  if (friends && allUsers) {
    for (const id of friends) {
      currentUserPalz.push(allUsers.filter((user) => user._id === id)[0]);
    }
  }

  const friendsWithCommonInterests: TUser[] = [];
  for (const pal of currentUserPalz) {
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
      "in my city": currentUserPalz.filter((user) => user.city === currentUser?.city),
    }),
    ...(currentUser?.stateProvince !== "" && {
      "in my state": currentUserPalz.filter(
        (user) => user.stateProvince === currentUser?.stateProvince
      ),
    }),
    ...(currentUser?.country !== "" && {
      "in my country": currentUserPalz.filter(
        (user) => user.country === currentUser?.country
      ),
    }),
    ...(currentUser?.interests.length && {
      "common interests": friendsWithCommonInterests,
    }),
  };

  const resetDisplayedFriends = (): void => setDisplayedItems(currentUserPalz);

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
    if (!currentUser && userCreatedAccount === null) {
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
      let newDisplayedItems: (TEvent | TUser)[] = [];
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
          const filterOptionPotentialFriends: TUser[] = Object.values(
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
        for (const pal of currentUserPalz) {
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
  const filterOptions = !fetchAllUsersQuery.isLoading ? getFilterOptions() : [];

  // Display "loading..." if query is still loading; if not loading & displayed items is empty, show related message. If not loading & displayed items isn't empty, render those items.
  // Get values only if query isn't loading

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>{pageHeading}</h1>
      {!fetchAllUsersQuery.isLoading &&
        !fetchAllUsersQuery.isError &&
        displayedItems.length === 0 &&
        usedFor === "potential-friends" &&
        searchTerm === "" &&
        activeFilters.length === 0 && (
          <h2>No more potential friends. You must be popular!</h2>
        )}
      {!fetchAllUsersQuery.isLoading &&
        !fetchAllUsersQuery.isError &&
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
      {!fetchAllUsersQuery.isLoading &&
        !fetchAllUsersQuery.isError &&
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
      {!fetchAllUsersQuery.isLoading &&
        !fetchAllUsersQuery.isError &&
        (displayedItems.length > 0 ||
          (displayedItems.length === 0 && searchTerm !== "") ||
          (displayedItems.length === 0 && activeFilters.length > 0)) && (
          <search className="search-tools-container">
            <SearchBar
              input={searchTerm}
              placeholder={
                usedFor === "events" ? "Search events" : "Search potential palz"
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
      {!fetchAllUsersQuery.isLoading && !fetchAllUsersQuery.isError && (
        <div className="all-cards-container">
          {usedFor === "events" &&
            Methods.removeDuplicatesFromArray(displayedItemsFiltered).map(
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
        query={usedFor !== "events" ? fetchAllUsersQuery : fetchAllEventsQuery}
        errorMessage={
          usedFor !== "events" ? "Error fetching users" : "Error fetching events"
        }
      />
    </div>
  );
};

export default DisplayedCardsPage;
