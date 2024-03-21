import { useState, useEffect, createContext, ReactNode } from "react";
import { TMainContext } from "../types";
import Requests from "../requests";

export const MainContext = createContext<TMainContext | null>(null);

export const MainContextProvider = ({ children }: { children: ReactNode }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [rsvpdEvents, setRsvpdEventsByUser] = useState([]);
  const [favoritedEvents, setFavoritedEventsByUser] = useState([]);
  const [attendedEvents, setAttendedEventsByUser] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [eventsByTag, setEventsByTag] = useState([]);
  const [allInterests, setAllInterests] = useState([]);

  useEffect(() => {
    Requests.getAllUsers()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllUsers(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    // Get allEvents:
    Requests.getAllEvents()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllEvents(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getRsvpdEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setRsvpdEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getFavoritedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setFavoritedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getAttendedEventsByUser()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAttendedEventsByUser(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getUserInterests()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setUserInterests(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getEventsbyTag()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setEventsByTag(JSON.parse(result));
      })
      .catch((error) => console.log(error));

    Requests.getAllInterests()
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        setAllInterests(JSON.parse(result));
      })
      .catch((error) => console.log(error));
  }, []);

  const mainContextValues: TMainContext = {
    allUsers,
    allEvents,
    rsvpdEvents,
    favoritedEvents,
    attendedEvents,
    userInterests,
    eventsByTag,
    allInterests,
  };

  return (
    <MainContext.Provider value={mainContextValues}>{children}</MainContext.Provider>
  );
};
