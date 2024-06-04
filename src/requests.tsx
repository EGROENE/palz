import { TUser, TEvent } from "./types";

const getAllUsers = (): Promise<TUser[]> => {
  return fetch("http://localhost:3000/users", {
    method: "GET",
    redirect: "follow",
  }).then((response) => response.json() as Promise<TUser[]>);
};

const getAllEvents = (): Promise<TEvent[]> => {
  return fetch("http://localhost:3000/events", {
    method: "GET",
    redirect: "follow",
  }).then((response) => response.json() as Promise<TEvent[]>);
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
    "phoneCountry": "",
    "phoneCountryCode": "",
    "phoneNumberWithoutCountryCode": "",
    "instagram": "",
    "facebook": "",
    "x": "",
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
    "city"?: string | undefined;
    "stateProvince"?: string | undefined;
    "country"?: string | undefined;
    "facebook"?: string | undefined;
    "instagram"?: string | undefined;
    "x"?: string | undefined;
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

const deleteLocation = (user: TUser | undefined): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "city": "",
    "stateProvince": "",
    "country": "",
  });

  return fetch(`http://localhost:3000/users/${user?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteUserAbout = (user: TUser | undefined): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "about": "",
  });

  return fetch(`http://localhost:3000/users/${user?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteSocialMedium = (
  user: TUser | undefined,
  medium: "facebook" | "instagram" | "x"
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    if (medium === "facebook") {
      return JSON.stringify({ "facebook": "" });
    } else if (medium === "instagram") {
      return JSON.stringify({ "instagram": "" });
    } else if (medium === "x") {
      return JSON.stringify({ "x": "" });
    }
  };

  const raw = getRaw();

  return fetch(`http://localhost:3000/users/${user?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteUserInterest = (
  user: TUser | undefined,
  interest: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "interests": user?.interests.filter((int) => int !== interest),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:3000/users/${user?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addUserInterest = (
  user: TUser | undefined,
  interest: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedInterestsArray: string[] = [];
  if (user?.interests) {
    for (const int of user.interests) {
      updatedInterestsArray.push(int);
    }
    updatedInterestsArray.push(interest);
  }

  const getRaw = () => {
    return JSON.stringify({
      "interests": updatedInterestsArray,
    });
  };
  const raw = getRaw();

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

const addUserRSVP = (user: TUser | undefined, event: TEvent): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedInterestedUsersArray: Array<string | number | undefined> = [];
  for (const intUser of event.interestedUsers) {
    updatedInterestedUsersArray.push(intUser);
  }
  if (user?.username) {
    updatedInterestedUsersArray.push(user.id);
  }

  const getRaw = () => {
    return JSON.stringify({
      "interestedUsers": updatedInterestedUsersArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:3000/events/${event?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteUserRSVP = (user: TUser | undefined, event: TEvent) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "interestedUsers": event?.interestedUsers.filter((id) => id !== user?.id),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:3000/events/${event?.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteEvent = (event: TEvent): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(`http://localhost:3000/events/${event.id}`, {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  });
};

const Requests = {
  deleteEvent,
  addUserRSVP,
  deleteUserRSVP,
  getAllUsers,
  getAllEvents,
  getAttendedEventsByUser,
  createUser,
  patchUpdatedUserInfo,
  deletePhoneNumber,
  deleteUser,
  deleteLocation,
  deleteSocialMedium,
  deleteUserAbout,
  deleteUserInterest,
  addUserInterest,
};
export default Requests;
