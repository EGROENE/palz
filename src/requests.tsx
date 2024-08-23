import { TUser, TEvent, TEventValuesToUpdate, TUserValuesToUpdate } from "./types";

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

const updateEventsOrganized = (
  user: TUser,
  eventID: string | number
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedEventOrganizedArray: (string | number)[] = [];
  if (user?.eventsOrganized) {
    for (const event of user.eventsOrganized) {
      if (event.id) {
        updatedEventOrganizedArray.push(event.id);
      }
    }
    updatedEventOrganizedArray.push(eventID);
  }

  const getRaw = () => {
    return JSON.stringify({
      "eventsOrganized": updatedEventOrganizedArray,
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

const updateEventsAttended = (
  user: TUser,
  eventID: string | number
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedEventsAttendedArray: (string | number)[] = [];
  if (user?.eventsAttended) {
    for (const event of user.eventsAttended) {
      if (event.id) {
        updatedEventsAttendedArray.push(event.id);
      }
    }
    updatedEventsAttendedArray.push(eventID);
  }

  const getRaw = () => {
    return JSON.stringify({
      "eventsAttended": updatedEventsAttendedArray,
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
    "eventsOrganized": [],
    "eventsAttended": [],
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
    "profileVisibleTo": newUserData.profileVisibleTo,
    "whoCanAddUserAsOrganizer": newUserData.whoCanAddUserAsOrganizer,
    "whoCanInviteUser": newUserData.whoCanInviteUser,
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
  valuesToUpdate: TUserValuesToUpdate
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

const addEventInterest = (
  event: TEvent | undefined,
  interest: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedInterestsArray: string[] = [];
  if (event?.relatedInterests) {
    for (const int of event.relatedInterests) {
      updatedInterestsArray.push(int);
    }
    updatedInterestsArray.push(interest);
  }

  const getRaw = () => {
    return JSON.stringify({
      "relatedInterests": updatedInterestsArray,
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

const deleteEventInterest = (
  event: TEvent | undefined,
  interest: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "relatedInterests": event?.relatedInterests.filter((int) => int !== interest),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:3000/users/${event?.id}`, {
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

const createEvent = (eventData: TEvent): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "title": eventData.title,
    "creator": eventData.creator,
    "organizers": eventData.organizers,
    "invitees": eventData.invitees,
    "description": eventData.description,
    "additionalInfo": eventData.additionalInfo,
    "city": eventData.city,
    "stateProvince": eventData.stateProvince,
    "country": eventData.country,
    "publicity": eventData.publicity,
    "eventStartDateMidnightUTCInMS": eventData.eventStartDateMidnightUTCInMS,
    "eventStartTimeAfterMidnightUTCInMS": eventData.eventStartTimeAfterMidnightUTCInMS,
    "eventStartDateTimeInMS": eventData.eventStartDateTimeInMS,
    "eventEndDateMidnightUTCInMS": eventData.eventEndDateMidnightUTCInMS,
    "eventEndTimeAfterMidnightUTCInMS": eventData.eventEndTimeAfterMidnightUTCInMS,
    "eventEndDateTimeInMS": eventData.eventEndDateTimeInMS,
    "maxParticipants": eventData.maxParticipants,
    "address": eventData.address,
    "interestedUsers": [],
    "imageOne": eventData.imageOne,
    "imageTwo": eventData.imageTwo,
    "imageThree": eventData.imageThree,
    "relatedInterests": eventData.relatedInterests,
  });

  return fetch("http://localhost:3000/events", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const updateEvent = (
  event: TEvent,
  valuesToUpdate: TEventValuesToUpdate | undefined
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(valuesToUpdate);

  return fetch(`http://localhost:3000/events/${event.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteEvent = (event: TEvent | undefined): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(`http://localhost:3000/events/${event?.id}`, {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  });
};

const removeInvitee = (event: TEvent, user: TUser | undefined): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "invitees": event.invitees.filter((id) => id !== user?.id),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:3000/events/${event.id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const removeOrganizer = (
  event: TEvent | undefined,
  user: TUser | undefined
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "organizers": event?.organizers.filter((id) => id !== user?.id),
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

const Requests = {
  updateEventsOrganized,
  updateEventsAttended,
  updateEvent,
  removeInvitee,
  removeOrganizer,
  createEvent,
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
  addEventInterest,
  deleteEventInterest,
};
export default Requests;
