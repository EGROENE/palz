import { useEffect, useRef, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import UserCard from "../../Elements/UserCard/UserCard";
import Methods from "../../../methods";
import { TEvent, TThemeColor, TUser } from "../../../types";
import FilterDropdown from "../../Elements/FilterDropdown/FilterDropdown";
import SearchBar from "../../Elements/SearchBar/SearchBar";
import toast from "react-hot-toast";

const DiscoverPage = ({ usedFor }: { usedFor: "events" | "potential-friends" }) => {
  const {
    allEvents,
    allUsers,
    fetchAllEvents,
    fetchAllUsers,
    currentUser,
    userCreatedAccount,
  } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }

    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  const now = Date.now();

  const [displayedItems, setDisplayedItems] = useState<(TEvent | TUser)[]>([]);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [searchBoxIsFocused, setSearchBoxIsFocused] = useState<boolean>(false);
  const searchBoxRef = useRef<HTMLInputElement | null>(null);

  // Re-render page as changes (for now, RSVPs) are made to events in allEvents, taking into account any existing search term or filter
  /* Before, when RSVPing/de-RSVPing, RSVP button text wasn't updating properly b/c component didn't have access to updated events in allEvents (which were updating properly) until a page refresh, but now, this UI will hot update b/c of functionality in a useEffect that updates displayedEvents that depends on allEvents */
  useEffect(() => {
    if (usedFor === "events") {
      fetchAllEvents();
      if (searchTerm.trim() !== "") {
        let newDisplayedEvents: TEvent[] = [];

        const allPublicEventsThatStartOrEndInFuture: TEvent[] = allEvents.filter(
          (event) =>
            (event.eventStartDateTimeInMS > now || event.eventEndDateTimeInMS > now) &&
            event.publicity === "public"
        );

        for (const event of allPublicEventsThatStartOrEndInFuture) {
          // Get arrays of organizer full names & usernames so they are searchable (need to look up user by id):
          let eventOrganizerNames: string[] = [];
          let eventOrganizerUsernames: string[] = [];
          for (const id of event.organizers) {
            const matchingUser: TUser = allUsers.filter((user) => user?.id === id)[0];

            const fullName: string = `${matchingUser.firstName?.toLowerCase()} ${matchingUser.lastName?.toLowerCase()}`;
            eventOrganizerNames.push(fullName);

            if (matchingUser.username) {
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
        setDisplayedItems(newDisplayedEvents);
      } else if (activeFilters.length > 0) {
        let newDisplayedEvents: TEvent[] = [];
        for (const filter of activeFilters) {
          const indexOfArrayInFilterOptions =
            Object.keys(eventFilterOptions).indexOf(filter);
          const filterOptionEvents: TEvent[] =
            Object.values(eventFilterOptions)[indexOfArrayInFilterOptions];

          for (const filterOptionEvent of filterOptionEvents) {
            if (!newDisplayedEvents.map((ev) => ev.id).includes(filterOptionEvent?.id)) {
              newDisplayedEvents.push(filterOptionEvent);
            }
          }
        }
        setDisplayedItems(newDisplayedEvents);
      } else {
        setDisplayedItems(
          allEvents.filter(
            (event) =>
              event.publicity === "public" &&
              (event.eventEndDateTimeInMS > now || // end is in future
                event.eventStartDateTimeInMS > now) // start is in future
          )
        );
      }
    }
  }, [allEvents]);

  // EVENTS VARIABLES
  const displayableEvents = allEvents.filter(
    (event) =>
      (event.eventStartDateTimeInMS > now || event.eventEndDateTimeInMS > now) &&
      (event.publicity === "public" ||
        (currentUser?.id &&
          (event.invitees.includes(currentUser.id) ||
            event.organizers.includes(currentUser.id))))
  );

  const getEventsByCurrentUserInterests = (): TEvent[] => {
    let eventsByCurrentUserInterests = [];
    const updatedDisplayedEvents = displayableEvents;
    if (currentUser?.interests) {
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
  const eventsByCurrentUserInterests = getEventsByCurrentUserInterests();

  const getEventsOrganizedByCurrentUserFriends = (): TEvent[] => {
    let eventsOrganizedByCurrentUserFriends = [];
    const updatedDisplayedEvents = displayableEvents;
    if (currentUser?.friends) {
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
  const eventsOrganizedByCurrentUserFriends = getEventsOrganizedByCurrentUserFriends();

  const getEventsRSVPdByCurrentUserFriends = (): TEvent[] => {
    let eventsRSVPdByCurrentUserFriends = [];
    const updatedDisplayedEvents = displayableEvents;
    if (currentUser?.friends) {
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
  const eventsRSVPdByCurrentUserFriends = getEventsRSVPdByCurrentUserFriends();

  // Object containing filter options & the corresponding arrays of events
  // for pot. friends, filter by city, state, country, friends of friends, common interests. put in var potentialFriendsFilterOptions
  const eventFilterOptions = {
    ...(currentUser?.city !== "" && {
      "my city": displayableEvents.filter((event) => event.city === currentUser?.city),
    }),
    ...(currentUser?.stateProvince !== "" && {
      "my state": displayableEvents.filter(
        (event) => event.stateProvince === currentUser?.stateProvince
      ),
    }),
    ...(currentUser?.country !== "" && {
      "my country": displayableEvents.filter(
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

  const resetDisplayedEvents = () => setDisplayedItems(displayableEvents);
  //////////////////////////////////////////

  // POTENTIAL-FRIENDS VARIABLES
  // display only users whose profile is visible to anyone, to friends & currentUser is friend, and friends of friends & currentUser is a friend of a user's friend
  const allOtherNonFriendUsers = allUsers.filter(
    (user) =>
      currentUser?.id &&
      user.id !== currentUser.id &&
      !user.friends.includes(currentUser.id)
  );
  const nonFriendUsersVisibleToAnyone = allOtherNonFriendUsers.filter(
    (user) => user.profileVisibleTo === "anyone"
  );
  const nonFriendUsersVisibleToFriends = allOtherNonFriendUsers.filter(
    (user) => user.profileVisibleTo === "friends"
  );
  const nonFriendUsersVisibleToFriendsOfFriends = allOtherNonFriendUsers.filter(
    (user) => user.profileVisibleTo === "friends of friends"
  );

  /* Function to return for display an array of users whose profiles are visible to anyone, or to friends of friends & currentUser is a friend of a friend */
  const getDisplayablePotentialFriends = (): TUser[] => {
    let displayablePotentialFriends = nonFriendUsersVisibleToAnyone;

    for (const user of nonFriendUsersVisibleToFriends) {
      if (currentUser?.id && user.friends.includes(currentUser.id)) {
        displayablePotentialFriends.push(user);
      }
    }

    for (const user of nonFriendUsersVisibleToFriendsOfFriends) {
      // for each friend of user, check if their friends arr includes currentUser.id
      // will need to get TUser of friend, not just id
      const userFriends: TUser[] = []; // array of user's friends in TUser form
      // Push user in allUsers w/ id that matches friendID into userFriends
      for (const friendID of user.friends) {
        userFriends.push(allUsers.filter((u) => u.id === friendID)[0]);
      }
      /* for every friend of userFriends, check if their friends list includes currentUser.id & push to displayablePotentialFriends if it does */
      for (const friend of userFriends) {
        if (currentUser?.id && friend.friends.includes(currentUser.id)) {
          displayablePotentialFriends.push(friend);
        }
      }
    }
    return displayablePotentialFriends;
  };
  const displayablePotentialFriends = getDisplayablePotentialFriends();

  const getFriendsOfFriends = (): TUser[] => {
    // get TUser object that matches each id in currentUser.friends:
    let currentUserFriends: TUser[] = [];
    if (currentUser?.friends) {
      for (const friendID of currentUser.friends) {
        currentUserFriends.push(allUsers.filter((u) => u.id === friendID)[0]);
      }
    }
    // get TUser object that matches each id in friends array of each of currentUser's friends
    let friendsOfFriends: TUser[] = [];
    for (const friend of currentUserFriends) {
      for (const friendID of friend.friends) {
        friendsOfFriends.push(allUsers.filter((u) => u.id === friendID)[0]);
      }
    }
    return friendsOfFriends;
  };
  const friendsOfFriends = getFriendsOfFriends();

  const getPotentialFriendsWithCommonInterests = (): TUser[] => {
    let potentialFriendsWithCommonInterests: TUser[] = [];
    if (currentUser?.interests) {
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

  const resetDisplayedPotentialFriends = () =>
    setDisplayedItems(displayablePotentialFriends);
  //////////////////////////////////////////////////////////////

  /*  const resetFiltersAndSearch =() => {
    resetDisplayedEvents();
    setActiveFilters([]);
    setSearchTerm("");
  } */

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please login before accessing this page");
      navigation("/");
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
            if (!newDisplayedItems.map((ev) => ev.id).includes(filterOptionEvent?.id)) {
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
                .map((potFriend) => potFriend.id)
                .includes(filterOptionPotentialFriend?.id)
            ) {
              newDisplayedItems.push(filterOptionPotentialFriend);
            }
          }
        }
      }
      setDisplayedItems(newDisplayedItems);
    } else {
      resetDisplayedEvents();
    }
  };

  const handleSearchTermInput = (input: string) => {
    if (activeFilters.length > 0) {
      setActiveFilters([]);
    }

    const inputCleaned = input.replace(/\s+/g, " ");
    setSearchTerm(inputCleaned);

    if (inputCleaned.trim() !== "") {
      if (usedFor === "events") {
        let newDisplayedEvents: TEvent[] = [];

        const allPublicEventsThatStartOrEndInFuture: TEvent[] = allEvents.filter(
          (event) =>
            (event.eventStartDateTimeInMS > now || event.eventEndDateTimeInMS > now) &&
            event.publicity === "public"
        );

        for (const event of allPublicEventsThatStartOrEndInFuture) {
          // Get arrays of organizer full names & usernames so they are searchable (need to look up user by id):
          let eventOrganizerNames: string[] = [];
          let eventOrganizerUsernames: string[] = [];
          for (const id of event.organizers) {
            const matchingUser: TUser = allUsers.filter((user) => user?.id === id)[0];

            const fullName: string = `${matchingUser.firstName?.toLowerCase()} ${matchingUser.lastName?.toLowerCase()}`;
            eventOrganizerNames.push(fullName);

            if (matchingUser.username) {
              eventOrganizerUsernames.push(matchingUser.username);
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
            potentialFriend.firstName?.includes(inputCleaned) ||
            potentialFriend.lastName?.includes(inputCleaned) ||
            potentialFriend.username?.includes(inputCleaned) ||
            potentialFriend.city.includes(inputCleaned) ||
            potentialFriend.country.includes(inputCleaned) ||
            potentialFriend.stateProvince.includes(inputCleaned)
          ) {
            newDisplayedPotentialFriends.push(potentialFriend);
          }
        }
        setDisplayedItems(newDisplayedPotentialFriends);
      }
    } else {
      if (usedFor === "events") {
        resetDisplayedEvents();
      }
      if (usedFor === "potential-friends") {
        resetDisplayedPotentialFriends();
      }
    }
  };

  const handleClearSearchTerm = (): void => {
    setSearchTerm("");
    resetDisplayedEvents();
  };
  //////////////////////////////////////////////

  const isTEvent = (value: any): value is TEvent => {
    if (value.eventStartDateTimeInMS) {
      return true;
    }
    return false;
  };

  const isTUser = (value: any): value is TUser => {
    if (value.username) {
      return true;
    }
    return false;
  };

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>{usedFor === "events" ? "Events" : "Find Palz"}</h1>
      <div className="search-tools-container">
        <SearchBar
          input={searchTerm}
          placeholder={usedFor === "events" ? "Search events" : "Search potential palz"}
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
          filterOptions={
            usedFor === "events"
              ? Object.keys(eventFilterOptions)
              : Object.keys(potentialFriendFilterOptions)
          }
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          handleAddDeleteFilter={handleAddDeleteFilter}
          randomColor={randomColor}
        />
      </div>
      <div className="all-events-container">
        {usedFor === "events" &&
          displayedItems.map(
            (item) => isTEvent(item) && <EventCard key={item.id} event={item} />
          )}
        {usedFor === "potential-friends" &&
          displayedItems.map(
            (item) => isTUser(item) && <UserCard key={item.id} user={item} />
          )}
      </div>
    </div>
  );
};

export default DiscoverPage;