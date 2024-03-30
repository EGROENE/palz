import { TNewUser } from "./types";

const getAllUsers = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/users", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getAllEvents = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/events", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getRsvpdEventsByUser = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/rsvpd-events", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getFavoritedEventsByUser = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/favorited-events", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getAttendedEventsByUser = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/attended-events", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getUserInterests = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/user-interests", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getEventsbyTag = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/events-by-tag", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const getAllInterests = (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch("http://localhost:3000/allInterests", {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const createUser = (newUserData: TNewUser): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "firstName": newUserData.firstName,
    "lastName": newUserData.lastName,
    "username": newUserData.username,
    "password": newUserData.password,
    "emailAddress": newUserData.emailAddress,
  });

  return fetch("http://localhost:3000/users", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const Requests = {
  getAllUsers,
  getAllEvents,
  getRsvpdEventsByUser,
  getFavoritedEventsByUser,
  getAttendedEventsByUser,
  getUserInterests,
  getEventsbyTag,
  getAllInterests,
  createUser,
};
export default Requests;
