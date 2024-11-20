import { TUser, TEvent, TEventValuesToUpdate, TUserValuesToUpdate } from "./types";

const getAllUsers = (): Promise<TUser[]> => {
  return fetch("http://localhost:4000/palz/users", {
    method: "GET",
    redirect: "follow",
  }).then((response) => response.json() as Promise<TUser[]>);
};

const getAllEvents = (): Promise<TEvent[]> => {
  return fetch("http://localhost:4000/palz/events", {
    method: "GET",
    redirect: "follow",
  }).then((response) => response.json() as Promise<TEvent[]>);
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
    "friends": [],
    "friendRequestsReceived": [],
    "friendRequestsSent": [],
    "blockedUsers": [],
    "profileVisibleTo": newUserData.profileVisibleTo,
    "whoCanAddUserAsOrganizer": newUserData.whoCanAddUserAsOrganizer,
    "whoCanMessage": newUserData.whoCanMessage,
    "whoCanInviteUser": newUserData.whoCanInviteUser,
  });

  return fetch("http://localhost:4000/palz/users/", {
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

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const updateUserProfileImage = (
  user: TUser | null,
  newImage: string | unknown
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({ profileImage: newImage });

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deletePhoneNumber = (user: TUser | null): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "phoneCountry": "",
    "phoneCountryCode": "",
    "phoneNumberWithoutCountryCode": "",
  });

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteLocation = (user: TUser | null): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "city": "",
    "stateProvince": "",
    "country": "",
  });

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteUserAbout = (user: TUser | null): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "about": "",
  });

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
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

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
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

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
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

  return fetch(`http://localhost:4000/palz/users/${user?._id}`, {
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

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
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

  return fetch(`http://localhost:4000/palz/users/${event?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteUser = (userID: string | undefined): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-type", "application/json");

  return fetch(`http://localhost:4000/palz/users/${userID}`, {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  });
};

const addUserRSVP = (user: TUser | null, event: TEvent): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedInterestedUsersArray: Array<string> = [];
  for (const intUser of event.interestedUsers) {
    updatedInterestedUsersArray.push(intUser);
  }
  if (user && user._id) {
    updatedInterestedUsersArray.push(user._id);
  }

  const getRaw = () => {
    return JSON.stringify({
      "interestedUsers": updatedInterestedUsersArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addToDisinterestedUsers = (
  user: TUser | null,
  event: TEvent
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedDisinterestedUsersArray: Array<string | number | undefined> = [];
  for (const disintUser of event.disinterestedUsers) {
    updatedDisinterestedUsersArray.push(disintUser);
  }
  if (user?.username) {
    updatedDisinterestedUsersArray.push(user._id);
  }

  const getRaw = () => {
    return JSON.stringify({
      "disinterestedUsers": updatedDisinterestedUsersArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
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
      "interestedUsers": event?.interestedUsers.filter((id) => id !== user?._id),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
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
    "images": eventData.images,
    "relatedInterests": eventData.relatedInterests,
  });

  return fetch("http://localhost:4000/palz/events", {
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

  return fetch(`http://localhost:4000/palz/events/${event._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addEventImage = (
  event: TEvent | undefined,
  newImage: string
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({ images: event?.images?.concat(newImage) });

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const removeEventImage = (event: TEvent | undefined, imageToRemove: string | unknown) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    if (event && event.images) {
      return JSON.stringify({
        "images": event.images.filter((image) => image !== imageToRemove),
      });
    }
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteEvent = (event: TEvent | undefined): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
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
      "invitees": event.invitees.filter((id) => id !== user?._id),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/events/${event._id}`, {
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
      "organizers": event?.organizers.filter((id) => id !== user?._id),
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/events/${event?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addToFriendRequestsReceived = (
  senderID: string,
  recipient: TUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsReceivedArray: Array<string | undefined> = [];
  if (recipient?.friendRequestsReceived) {
    for (const existingSenderID of recipient.friendRequestsReceived) {
      updatedFriendRequestsReceivedArray.push(existingSenderID);
    }
  }
  updatedFriendRequestsReceivedArray.push(senderID);

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsReceived": updatedFriendRequestsReceivedArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${recipient?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addToFriendRequestsSent = (
  sender: TUser,
  recipientID: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedFriendRequestsSentArray = sender.friendRequestsSent.concat(recipientID);
  /* if (sender?.friendRequestsSent) {
    for (const existingRecipientID of sender.friendRequestsSent) {
      updatedFriendRequestsSentArray.push(existingRecipientID);
    }
  }
  updatedFriendRequestsSentArray.push(recipientID); */

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsSent": updatedFriendRequestsSentArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${sender?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const removeFromFriendRequestsReceived = (
  senderID: string,
  recipient: TUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsArray = recipient?.friendRequestsReceived.filter(
    (id) => id !== senderID
  );

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsReceived": updatedFriendRequestsArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${recipient?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const removeFromFriendRequestsSent = (
  sender: TUser,
  recipientID: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsArray = sender.friendRequestsSent.filter(
    (id) => id !== recipientID
  );

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsSent": updatedFriendRequestsArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${sender._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

/* const acceptFriendRequest = (
  sender: string | number,
  recipient: TUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsArray: Array<string | number | undefined> = [];
  for (const existingSenderID of recipient.friendRequestsReceived) {
    updatedFriendRequestsArray.push(existingSenderID);
  }
  updatedFriendRequestsArray.push(sender);

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsReceived": updatedFriendRequestsArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:3000/users/${recipient?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
}; */

const addFriendToFriendsArray = (user: TUser, friend: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedFriendsArray = user?.friends.concat(friend);
  /* if (user?.friends) {
    for (const existingFriendID of user.friendRequestsSent) {
      updatedFriendsArray.push(existingFriendID);
    }
  } */
  //updatedFriendsArray.push(friend);

  var raw = JSON.stringify({
    "friends": updatedFriendsArray,
  });

  return fetch(`http://localhost:4000/palz/users/${user._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteFriendFromFriendsArray = (user: TUser, friend: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendsArray = user.friends.filter((f) => f !== friend);

  var raw = JSON.stringify({
    "friends": updatedFriendsArray,
  });

  return fetch(`http://localhost:4000/palz/users/${user._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const Requests = {
  removeEventImage,
  addEventImage,
  addToDisinterestedUsers,
  updateUserProfileImage,
  addFriendToFriendsArray,
  deleteFriendFromFriendsArray,
  addToFriendRequestsReceived,
  addToFriendRequestsSent,
  removeFromFriendRequestsReceived,
  removeFromFriendRequestsSent,
  updateEvent,
  removeInvitee,
  removeOrganizer,
  createEvent,
  deleteEvent,
  addUserRSVP,
  deleteUserRSVP,
  getAllUsers,
  getAllEvents,
  //getAttendedEventsByUser,
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
