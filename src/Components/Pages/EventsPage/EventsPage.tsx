import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import EventCard from "../../Elements/EventCard/EventCard";
import Methods from "../../../methods";
import { TEvent, TThemeColor } from "../../../types";
import FilterDropdown from "../../Elements/FilterDropdown/FilterDropdown";

const EventsPage = () => {
  const { allEvents, fetchAllEvents, currentUser, userCreatedAccount } = useMainContext();
  const { showSidebar, setShowSidebar } = useUserContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
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

  const [displayedEvents, setDisplayedEvents] = useState<TEvent[]>(
    allEvents.filter(
      (event) =>
        event.eventEndDateTimeInMS > now || // end is in future
        event.eventStartDateTimeInMS > now // start is in future
    )
  );

  /*  const resetFiltersAndSearch =() => {
    setDisplayedEvents(allEvents.filter(
      (event) =>
        event.eventEndDateTimeInMS > now || // end is in future
        event.eventStartDateTimeInMS > now // start is in future
    ))
    setActiveFilters([])
  } */

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  useEffect(() => {
    fetchAllEvents();
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  const getEventsByCurrentUserInterests = (): TEvent[] => {
    let eventsByCurrentUserInterests = [];
    if (currentUser?.interests) {
      for (const interest of currentUser?.interests) {
        for (const event of displayedEvents) {
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
    if (currentUser?.friends) {
      for (const friend of currentUser.friends) {
        for (const event of displayedEvents) {
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
    if (currentUser?.friends) {
      for (const friend of currentUser.friends) {
        for (const event of displayedEvents) {
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
  const filterOptions = {
    ...(currentUser?.city !== "" && {
      "my city": allEvents.filter((event) => event.city === currentUser?.city),
    }),
    ...(currentUser?.stateProvince !== "" && {
      "my state": allEvents.filter(
        (event) => event.stateProvince === currentUser?.stateProvince
      ),
    }),
    ...(currentUser?.country !== "" && {
      "my country": allEvents.filter((event) => event.country === currentUser?.country),
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

  const handleAddDeleteFilter = (option: string): void => {
    // If activeFilters includes option, delete it from activeFilters and vice versa:
    const updatedActiveFiltersArray = activeFilters.includes(option)
      ? activeFilters.filter((o) => o !== option)
      : activeFilters.concat(option);
    setActiveFilters(updatedActiveFiltersArray);

    // If at least one filter, display events that can be described by the filter(s)
    // Else, if no filters (when user clears them all), reset to all events whose start or end is in future
    if (updatedActiveFiltersArray.length > 0) {
      let newDisplayedEvents: TEvent[] = [];
      for (const filter of updatedActiveFiltersArray) {
        const indexOfArrayInFilterOptions = Object.keys(filterOptions).indexOf(filter);
        const filterOptionEvents: TEvent[] =
          Object.values(filterOptions)[indexOfArrayInFilterOptions];

        for (const filterOptionEvent of filterOptionEvents) {
          if (!newDisplayedEvents.map((ev) => ev.id).includes(filterOptionEvent?.id)) {
            newDisplayedEvents.push(filterOptionEvent);
          }
        }
      }
      setDisplayedEvents(newDisplayedEvents);
    } else {
      setDisplayedEvents(
        allEvents.filter(
          (event) =>
            event.eventEndDateTimeInMS > now || // end is in future
            event.eventStartDateTimeInMS > now // start is in future
        )
      );
    }
  };

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Events</h1>
      <FilterDropdown
        dropdownBtnText="Filters"
        filterOptions={Object.keys(filterOptions)}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        handleAddDeleteFilter={handleAddDeleteFilter}
        randomColor={randomColor}
      />
      <div className="all-events-container">
        {Methods.sortEventsSoonestToLatest(displayedEvents).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
