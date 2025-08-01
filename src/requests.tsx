import {
  TUser,
  TBarebonesUser,
  TEvent,
  TChat,
  TEventValuesToUpdate,
  TUserValuesToUpdate,
  TChatValuesToUpdate,
  TOtherUser,
} from "./types";

const getAllUsers = () => {
  return fetch("http://localhost:4000/palz/users", {
    method: "GET",
    redirect: "follow",
  }).then((response) => response);
};

// Get rid of this eventually, once requests for different types of user groups are made
const getAllVisibleOtherUsers = (currentUser: TUser | null): Promise<TOtherUser[]> => {
  return fetch("http://localhost:4000/palz/users", {
    method: "GET",
    redirect: "follow",
  }).then((response) => {
    return response.json().then((allUsers: TUser[]) => {
      if (currentUser) {
        const otherUsers: TUser[] = allUsers.filter(
          (user) => user._id !== currentUser._id
        );
        /*
        filter out users whose profile isn't visible to currentUser b/c of privacy settings (if currentUser is blocked, or if otherUser's profile isn't visible to currentUser due to otherUser's privacy settings):
        */
        const visibleOtherUsers: TUser[] = otherUsers.filter((otherUser) => {
          if (currentUser._id) {
            const currentUserIsFriend: boolean =
              currentUser && currentUser._id
                ? otherUser.friends.includes(currentUser._id.toString())
                : false;

            const currentUserIsFriendOfFriend: boolean = otherUsers.some(
              (user) =>
                user &&
                user._id &&
                currentUser &&
                currentUser._id &&
                otherUser.friends.includes(user._id.toString()) &&
                otherUser.friends.includes(currentUser._id.toString()) &&
                !currentUser.friends.includes(user._id.toString()) &&
                !user.friends.includes(currentUser._id.toString())
            );

            const currentUserIsBlocked: boolean = otherUser.blockedUsers.includes(
              currentUser._id.toString()
            );

            if (
              !currentUserIsBlocked &&
              (otherUser.profileVisibleTo === "anyone" ||
                (otherUser.profileVisibleTo === "friends" && currentUserIsFriend) ||
                (otherUser.profileVisibleTo === "friends of friends" &&
                  currentUserIsFriendOfFriend))
            ) {
              return otherUser;
            }
          }
        });

        return visibleOtherUsers.map((otherUser) => {
          const currentUserIsFriend: boolean =
            currentUser && currentUser._id
              ? otherUser.friends.includes(currentUser._id.toString())
              : false;

          const currentUserIsFriendOfFriend: boolean = otherUsers.some(
            (user) =>
              user &&
              user._id &&
              currentUser &&
              currentUser._id &&
              otherUser.friends.includes(user._id.toString()) &&
              otherUser.friends.includes(currentUser._id.toString()) &&
              !currentUser.friends.includes(user._id.toString()) &&
              !user.friends.includes(currentUser._id.toString())
          );

          const showLocation: boolean =
            otherUser.whoCanSeeLocation === "anyone" ||
            (otherUser.whoCanSeeLocation === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeeLocation === "friends of friends" &&
              currentUserIsFriendOfFriend);

          const showPhoneNumber: boolean =
            otherUser.whoCanSeePhoneNumber === "anyone" ||
            (otherUser.whoCanSeePhoneNumber === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeePhoneNumber === "friends of friends" &&
              currentUserIsFriendOfFriend);

          const showEmailAddress: boolean =
            otherUser.whoCanSeeEmailAddress === "anyone" ||
            (otherUser.whoCanSeeEmailAddress === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeeEmailAddress === "friends of friends" &&
              currentUserIsFriendOfFriend);

          const showInstagram: boolean =
            otherUser.whoCanSeeInstagram === "anyone" ||
            (otherUser.whoCanSeeInstagram === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeeInstagram === "friends of friends" &&
              currentUserIsFriendOfFriend);

          const showFacebook: boolean =
            otherUser.whoCanSeeFacebook === "anyone" ||
            (otherUser.whoCanSeeFacebook === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeeFacebook === "friends of friends" &&
              currentUserIsFriendOfFriend);

          const showX: boolean =
            otherUser.whoCanSeeX === "anyone" ||
            (otherUser.whoCanSeeX === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeeX === "friends of friends" &&
              currentUserIsFriendOfFriend);

          const showFriends: boolean =
            otherUser.whoCanSeeFriendsList === "anyone" ||
            (otherUser.whoCanSeeFriendsList === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanSeeFriendsList === "friends of friends" &&
              currentUserIsFriendOfFriend);

          return {
            "_id": otherUser._id,
            "index:": otherUser.index,
            "firstName": otherUser.firstName,
            "lastName": otherUser.lastName,
            "username": otherUser.username,
            "profileImage": otherUser.profileImage,
            "interests": otherUser.interests,
            "about": otherUser.about,
            ...(showLocation && {
              city: otherUser.city,
            }),
            ...(showLocation && {
              stateProvince: otherUser.stateProvince,
            }),
            ...(showLocation && {
              country: otherUser.country,
            }),
            ...(showPhoneNumber && {
              phoneCountry: otherUser.phoneCountry,
            }),
            ...(showPhoneNumber && {
              phoneCountryCode: otherUser.phoneCountryCode,
            }),
            ...(showPhoneNumber && {
              phoneNumberWithoutCountryCode: otherUser.phoneNumberWithoutCountryCode,
            }),
            ...(showEmailAddress && {
              emailAddress: otherUser.emailAddress,
            }),
            ...(showInstagram && {
              instagram: otherUser.instagram,
            }),
            ...(showFacebook && {
              facebook: otherUser.facebook,
            }),
            ...(showX && {
              x: otherUser.x,
            }),
            ...(showFriends && {
              friends: otherUser.friends,
            }),
          };
        });
      }
    }) as Promise<TOtherUser[]>;
  });
};

const getCurrentUserUpcomingEvents = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(`http://localhost:4000/palz/homepage/${username}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

// Create getPotentialFriends (limit, like in getAllVisibleOtherUsers, then revert that request to its original form, to be used until it's eventually not needed anymore). getPotentialFriends should be all visible users who have no blocking relationship to currentUser.
const getPotentialFriends = async (
  currentUser: TUser,
  start: number,
  limit: number
): Promise<TUser[] | undefined> => {
  return fetch(
    `http://localhost:4000/palz/find-palz?start=${start}&limit=${limit}&user=${currentUser.username}`,
    {
      method: "GET",
      redirect: "follow",
    }
  ).then((response) => {
    return response.json().then((potentialFriends: TUser[]) => {
      if (currentUser && currentUser._id) {
        return potentialFriends.filter((user: TUser) => {
          const currentUserIsFriendOfFriend: boolean = user.friends.some((f) =>
            currentUser.friends.includes(f)
          );

          // if currentUser is friend of friend, and user's profile is visible to friends of friends, return user
          if (
            user.profileVisibleTo === "anyone" ||
            (user.profileVisibleTo === "friends of friends" &&
              currentUserIsFriendOfFriend)
          ) {
            return user;
          }
        });
      }
    });
  });
};

const getFriends = async (
  currentUser: TUser | null,
  start: number,
  limit: number
): Promise<TUser[]> => {
  return fetch(
    `http://localhost:4000/palz/my-palz?start=${start}&limit=${limit}&user=${currentUser?.username}`,
    {
      method: "GET",
      redirect: "follow",
    }
  ).then((response) => {
    return response.json().then((friends: TUser[]) => friends);
  });
};

const getUpcomingEventsUserRSVPdTo = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=upcomingEventsUserRSVPdTo`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const ongoingEvents = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=ongoingEvents`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getUpcomingEventsUserOrganizes = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=upcomingEventsUserOrganizes`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getUpcomingEventsUserInvitedTo = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=upcomingEventsUserInvitedTo`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getEventsUserCreated = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=eventsUserCreated`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getRecentEventsUserRSVPdTo = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=recentEventsUserRSVPdTo`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getRecentEventsUserOrganized = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=recentEventsUserOrganized`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getOngoingEvents = (username: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/otherUsers/${username}?eventsType=ongoingEvents`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getExplorableEvents = (
  currentUser: TUser | null,
  start: number,
  limit: number
): Promise<TEvent[]> => {
  var myHeaders = new Headers();
  myHeaders.append("Context-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/find-events/?start=${start}&limit=${limit}&user=${currentUser?.username}`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  ).then((response) => {
    return response.json().then((explorableEvents: TEvent[]) => explorableEvents);
  });
};

const getUserByID = (id: string): Promise<Response> => {
  return fetch(`http://localhost:4000/palz/users/_ids/${id}`, {
    method: "GET",
    redirect: "follow",
  });
};

const getUserByUsername = (username: string) => {
  return fetch(`http://localhost:4000/palz/users/usernames/${username}`, {
    method: "GET",
    redirect: "follow",
  });
};

const getUserByUsernamePhoneNumberOrEmailAddress = (
  _id: string,
  username: string,
  emailAddress: string,
  phoneCountryCode?: string,
  phoneNumberWithoutCountryCode?: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "_id": _id,
    "username": username,
    "emailAddress": emailAddress,
    ...(phoneCountryCode && {
      phoneCountryCode: phoneCountryCode,
    }),
    ...(phoneNumberWithoutCountryCode && {
      phoneNumberWithoutCountryCode: phoneNumberWithoutCountryCode,
    }),
  });

  return fetch("http://localhost:4000/palz/users/settings", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const getUserByUsernameOrEmailAddress = (
  password: string,
  username?: string,
  emailAddress?: string
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw;

  if (username) {
    raw = JSON.stringify({
      "username": username,
      "password": password,
    });
  }

  if (emailAddress) {
    raw = JSON.stringify({
      "emailAddress": emailAddress,
      "password": password,
    });
  }

  return fetch("http://localhost:4000/palz/users/login", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const getPotentialCoOrganizers = (
  eventID: string | undefined,
  eventType: "new" | "edit",
  currentUser: TUser | null,
  start: number,
  limit: number
) => {
  const url: string =
    eventType === "new"
      ? `http://localhost:4000/palz/add-event?start=${start}&limit=${limit}&user=${currentUser?.username}&list=potentialCoOrganizers`
      : `http://localhost:4000/palz/edit-event/${eventID}?start=${start}&limit=${limit}&user=${currentUser?.username}&list=potentialCoOrganizers`;

  return fetch(url, {
    method: "GET",
    redirect: "follow",
  }).then((response) => {
    return response.json().then((potentialCOs: TUser[]) => {
      if (currentUser && currentUser._id) {
        return potentialCOs.filter((user) => {
          const currentUserIsFriendOfFriend: boolean = user.friends.some((f) =>
            currentUser.friends.includes(f)
          );

          const currentUserIsFriend =
            currentUser && currentUser._id
              ? user.friends.includes(currentUser._id.toString())
              : false;

          if (
            user.whoCanAddUserAsOrganizer === "anyone" ||
            (user.whoCanAddUserAsOrganizer === "friends of friends" &&
              currentUserIsFriendOfFriend) ||
            (user.whoCanAddUserAsOrganizer === "friends" && currentUserIsFriend)
          ) {
            return user;
          }
        });
      }
    });
  });
};

const getPotentialInvitees = (
  eventID: string | undefined,
  eventType: "new" | "edit",
  currentUser: TUser | null,
  start: number,
  limit: number
): Promise<TUser[] | undefined> => {
  const url: string =
    eventType === "new"
      ? `http://localhost:4000/palz/add-event?start=${start}&limit=${limit}&user=${currentUser?.username}&list=potentialInvitees`
      : `http://localhost:4000/palz/edit-event/${eventID}?start=${start}&limit=${limit}&user=${currentUser?.username}&list=potentialInvitees`;

  return fetch(url, {
    method: "GET",
    redirect: "follow",
  }).then((response) => {
    return response.json().then((potentialInvitees: TUser[]) => {
      if (currentUser && currentUser._id) {
        return potentialInvitees.filter((user) => {
          const currentUserIsFriendOfFriend: boolean = user.friends.some((f) =>
            currentUser.friends.includes(f)
          );

          const currentUserIsFriend =
            currentUser && currentUser._id
              ? user.friends.includes(currentUser._id.toString())
              : false;

          if (
            user.whoCanInviteUser === "anyone" ||
            (user.whoCanInviteUser === "friends of friends" &&
              currentUserIsFriendOfFriend) ||
            (user.whoCanInviteUser === "friends" && currentUserIsFriend)
          ) {
            return user;
          }
        });
      }
    });
  });
};

const getPotentialEventBlockees = (
  eventID: string | undefined,
  eventType: "new" | "edit",
  currentUser: TUser | null,
  start: number,
  limit: number
): Promise<TUser[]> => {
  const url: string =
    eventType === "new"
      ? `http://localhost:4000/palz/add-event?start=${start}&limit=${limit}&user=${currentUser?.username}&list=potentialEventBlockees`
      : `http://localhost:4000/palz/edit-event/${eventID}?start=${start}&limit=${limit}&user=${currentUser?.username}&list=potentialEventBlockees`;

  return fetch(url, {
    method: "GET",
    redirect: "follow",
  }).then((response) => {
    return response.json().then((potentialBlockees: TUser[]) => potentialBlockees);
  });
};

const getUsersToUpdateWhenCurrentUserDeletesAccount = (currentUser: TUser) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  console.log(currentUser);

  return fetch(
    `http://localhost:4000/palz/settings?username=${currentUser.username}&retrieve=relatedUsers`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
};

const getEventsRelatedToUser = (currentUser: TUser) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(
    `http://localhost:4000/palz/settings?username=${currentUser.username}&retrieve=relatedEvents`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );
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
    "_id": newUserData._id,
    "index": newUserData.index,
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
    "whoCanSeeLocation": newUserData.whoCanSeeLocation,
    "displayFriendCount": newUserData.displayFriendCount,
    "whoCanSeeFriendsList": newUserData.whoCanSeeFriendsList,
    "whoCanSeePhoneNumber": newUserData.whoCanSeePhoneNumber,
    "whoCanSeeEmailAddress": newUserData.whoCanSeeEmailAddress,
    "whoCanSeeFacebook": newUserData.whoCanSeeFacebook,
    "whoCanSeeX": newUserData.whoCanSeeX,
    "whoCanSeeInstagram": newUserData.whoCanSeeInstagram,
    "whoCanSeeEventsOrganized": newUserData.whoCanSeeEventsOrganized,
    "whoCanSeeEventsInterestedIn": newUserData.whoCanSeeEventsInterestedIn,
    "whoCanSeeEventsInvitedTo": newUserData.whoCanSeeEventsInvitedTo,
  });

  return fetch("http://localhost:4000/palz/users/signup", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addToBlockedUsers = (blocker: TUser, blockeeID: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedBlockedUsersArray = blocker.blockedUsers.concat(blockeeID);

  const getRaw = () => {
    return JSON.stringify({
      "blockedUsers": updatedBlockedUsersArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${blocker?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const addToBlockedBy = (blockee: TUser, blockerID: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedBlockedByArray = blockee.blockedBy.concat(blockerID);

  const getRaw = () => {
    return JSON.stringify({
      "blockedBy": updatedBlockedByArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${blockee?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const removeFromBlockedUsers = (blocker: TUser, blockee: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedBlockedUsersArray = blocker.blockedUsers.filter((bu) => bu !== blockee);

  const getRaw = () => {
    return JSON.stringify({
      "blockedUsers": updatedBlockedUsersArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${blocker?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const removeFromBlockedBy = (blockee: TUser, blocker: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedBlockedByArray = blockee.blockedBy.filter((b) => b !== blocker);

  const getRaw = () => {
    return JSON.stringify({
      "blockedBy": updatedBlockedByArray,
    });
  };
  const raw = getRaw();

  return fetch(`http://localhost:4000/palz/users/${blockee?._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const patchUpdatedUserInfo = (
  user: TUser | null,
  userValuesToUpdate: TUserValuesToUpdate
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(userValuesToUpdate);

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
  user: TUser | null,
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

const deleteUserInterest = (user: TUser | null, interest: string): Promise<Response> => {
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

const addUserInterest = (user: TUser | null, interest: string): Promise<Response> => {
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

  console.log(userID);

  return fetch(`http://localhost:4000/palz/users/${userID}`, {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  });
};

const addUserRSVP = (
  user: TOtherUser | TUser | null,
  event: TEvent
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getUpdatedInterestedUsersArray = (): string[] => {
    if (user && user._id) {
      return event.interestedUsers.concat(user?._id?.toString());
    }
    return event.interestedUsers;
  };
  const updatedInterestedUsersArray: string[] = getUpdatedInterestedUsersArray();

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

  const getUpdatedDisinterestedUsersArray = (): string[] => {
    if (user && user._id) {
      return event.disinterestedUsers.concat(user._id.toString());
    }
    return event.disinterestedUsers;
  };
  const updatedDisinterestedUsersArray: string[] = getUpdatedDisinterestedUsersArray();

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

const deleteFromDisinterestedUsers = (
  user: TBarebonesUser | null,
  event: TEvent
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "disinterestedUsers": event.disinterestedUsers.filter(
        (u) => user && u !== user?._id
      ),
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

const deleteUserRSVP = (user: TBarebonesUser | null, event: TEvent) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "interestedUsers": event.interestedUsers.filter((u) => u !== user?._id?.toString()),
  });

  return fetch(`http://localhost:4000/palz/events/${event._id?.toString()}`, {
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
    "index": eventData.index,
    "title": eventData.title,
    "creator": eventData.creator,
    "organizers": eventData.organizers,
    "invitees": eventData.invitees,
    "blockedUsersEvent": eventData.blockedUsersEvent,
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
  eventValuesToUpdate: TEventValuesToUpdate | undefined
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(eventValuesToUpdate);

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

const getEventByID = (eventID: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(`http://localhost:4000/palz/events/${eventID}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
};

const removeInvitee = (event: TEvent, user: TBarebonesUser | null): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "invitees": event.invitees.filter((i) => {
        if (i !== user?._id) {
          return i;
        }
      }),
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
  event: TEvent,
  user: TUser | TOtherUser | null
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "organizers": event.organizers.filter((o) => {
        if (o !== user?._id) {
          return o;
        }
      }),
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
  sender: TUser,
  recipient: TUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsReceivedArray: string[] = sender._id
    ? [...recipient.friendRequestsReceived, sender._id.toString()]
    : [...recipient.friendRequestsReceived];

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

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsSent": sender.friendRequestsSent.concat(recipientID),
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
  sender: TOtherUser,
  recipient: TUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsReceived": recipient?.friendRequestsReceived.filter(
        (elem) => elem !== sender._id
      ),
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
  recipient: TUser | TOtherUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsArray: string[] = sender.friendRequestsSent.filter(
    (elem) => elem !== recipient._id
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

const addFriendToFriendsArray = (user: TUser, friend: TUser): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedFriendsArray = friend._id && user?.friends.concat(friend._id.toString());

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

const deleteFriendFromFriendsArray = (user: TUser, friend: TUser): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendsArray = user.friends.filter((f) => f !== friend._id);

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

const getCurrentUserChats = (user: TUser | null): Promise<TChat[]> | undefined => {
  if (user) {
    return fetch(`http://localhost:4000/palz/chats/${user._id}`, {
      method: "GET",
      redirect: "follow",
    }).then((response) => response.json() as Promise<TChat[]>);
  }
};

const getPotentialChatMembers = async (
  currentUser: TUser | null,
  start: number,
  limit: number,
  chat?: TChat | undefined
): Promise<TUser[]> => {
  return fetch(
    `http://localhost:4000/palz/chats?start=${start}&limit=${limit}&user=${currentUser?.username}`,
    {
      method: "GET",
      redirect: "follow",
    }
  ).then((response) => {
    return response.json().then((potentialCMs: TUser[]) => {
      return potentialCMs.filter((pcm: TUser) => {
        const userIsNotAlreadyInCurrentChat: boolean =
          pcm._id && chat && chat.members.includes(pcm._id.toString()) ? false : true;

        const currentUserIsFriendOfFriend: boolean = potentialCMs.some((pcm) => {
          if (currentUser && currentUser._id) {
            return pcm.friends.some((f) => currentUser.friends.includes(f));
          }
          return false;
        });

        const currentUserIsFriend: boolean =
          currentUser && currentUser._id
            ? pcm.friends.includes(currentUser._id?.toString())
            : false;

        if (
          userIsNotAlreadyInCurrentChat &&
          ((pcm.whoCanMessage === "friends" && currentUserIsFriend) ||
            (pcm.whoCanMessage === "friends of friends" && currentUserIsFriendOfFriend) ||
            pcm.whoCanMessage === "anyone")
        ) {
          return pcm;
        }
      });
    });
  });
};

const createNewChat = (newChat: TChat): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "_id": newChat._id,
    "members": newChat.members,
    "messages": newChat.messages,
    "chatType": newChat.chatType,
    "dateCreated": newChat.dateCreated,
    ...(newChat.chatName &&
      newChat.chatName.replace(/\s/g, "") !== "" && { chatName: newChat.chatName }),
    ...(newChat.admins && newChat.admins.length > 0 && { admins: newChat.admins }),
  });

  return fetch("http://localhost:4000/palz/chats/", {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const updateChat = (
  chat: TChat,
  chatValuesToUpdate: TChatValuesToUpdate
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(chatValuesToUpdate);

  return fetch(`http://localhost:4000/palz/chats/${chat._id}`, {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });
};

const deleteChat = (chatID: string) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return fetch(`http://localhost:4000/palz/chats/${chatID}`, {
    method: "DELETE",
    redirect: "follow",
  });
};

const Requests = {
  getCurrentUserUpcomingEvents,
  getEventsRelatedToUser,
  getUsersToUpdateWhenCurrentUserDeletesAccount,
  getEventsUserCreated,
  getOngoingEvents,
  getRecentEventsUserOrganized,
  getRecentEventsUserRSVPdTo,
  getUpcomingEventsUserInvitedTo,
  getUpcomingEventsUserOrganizes,
  ongoingEvents,
  getUpcomingEventsUserRSVPdTo,
  deleteFromDisinterestedUsers,
  getEventByID,
  getUserByUsername,
  getPotentialChatMembers,
  getPotentialEventBlockees,
  getExplorableEvents,
  getFriends,
  removeFromBlockedBy,
  addToBlockedBy,
  getPotentialFriends,
  getAllUsers,
  getPotentialCoOrganizers,
  getPotentialInvitees,
  getUserByUsernamePhoneNumberOrEmailAddress,
  getUserByUsernameOrEmailAddress,
  deleteChat,
  updateChat,
  createNewChat,
  getCurrentUserChats,
  removeFromBlockedUsers,
  addToBlockedUsers,
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
  getAllVisibleOtherUsers,
  getAllEvents,
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
  getUserByID,
};
export default Requests;
