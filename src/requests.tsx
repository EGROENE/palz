import { TUser } from "./types";

const getAllUsers = (): Promise<TUser[]> => {
  return fetch("http://localhost:3000/users", {
    method: "GET",
    redirect: "follow",
  }).then((response) => response.json() as Promise<TUser[]>);
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

const createUser = (newUserData: TUser): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "firstName": newUserData.firstName,
    "lastName": newUserData.lastName,
    "username": newUserData.username,
    "password": newUserData.password,
    "emailAddress": newUserData.emailAddress,
    "hostingCredits": 0,
    "city": "",
    "stateProvince": "",
    "country": "",
    "phoneNumber": "",
    "instagram": "",
    "facebook": "",
    "x": "",
    "telegram": "",
    "whatsapp": "",
    "profileImage": newUserData.profileImage,
    "about": "",
    "subscriptionType": "",
    "interests": [],
  });

  return fetch("http://localhost:3000/users", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const patchUpdatedUserInfo = (
  user: TUser | undefined,
  valuesToUpdate: {
    "firstName"?: string | undefined;
    "lastName"?: string | undefined;
    "username"?: string | undefined;
    "emailAddress"?: string | undefined;
    "password"?: string | undefined;
    "phoneCountry"?: string | undefined;
    "phoneCountryCode"?: string | undefined;
    "phoneNumberWithoutCountryCode"?: string | undefined;
  }
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(valuesToUpdate);

  return fetch(`http://localhost:3000/users/${user?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deletePhoneNumber = (user: TUser | undefined): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "phoneCountry": "",
    "phoneCountryCode": "",
    "phoneNumberWithoutCountryCode": "",
  });

  return fetch(`http://localhost:3000/users/${user?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteUser = (userID: number | string | undefined): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch(`http://localhost:3000/users/${userID}`, {
    method: "DELETE",
    headers: myHeaders,
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
  patchUpdatedUserInfo,
  deletePhoneNumber,
  deleteUser,
};
export default Requests;
