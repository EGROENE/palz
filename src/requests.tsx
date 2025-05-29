import {
  TUser,
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
                user.friends.includes(currentUser._id.toString())
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
              user.friends.includes(currentUser._id.toString())
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

// Create getPotentialFriends (limit, like in getAllVisibleOtherUsers, then revert that request to its original form, to be used until it's eventually not needed anymore). getPotentialFriends should be all visible users who have no blocking relationship to currentUser.
const getPotentialFriends = async (
  currentUser: TUser | null,
  start: number,
  limit: number
) => {
  return fetch(
    `http://localhost:4000/palz/find-palz?start=${start}&limit=${limit}&user=${currentUser?.username}`,
    {
      method: "GET",
      redirect: "follow",
    }
  ).then((response) => {
    //let potentialFriends: TOtherUser[] = [];
    return response.json().then((potentialFriends: TUser[]) => {
      if (currentUser && currentUser._id) {
        return potentialFriends.filter((user: TUser) => {
          const currentUserIsFriend: boolean =
            currentUser && currentUser._id
              ? user.friends.includes(currentUser._id.toString())
              : false;

          const currentUserIsFriendOfFriend: boolean = potentialFriends.some(
            (user) =>
              user &&
              user._id &&
              currentUser &&
              currentUser._id &&
              user.friends.includes(user._id.toString()) &&
              user.friends.includes(currentUser._id.toString())
          );

          // if currentUser is friend of friend, and user's profile is visible to friends of friends, return user
          if (
            user.profileVisibleTo === "anyone" ||
            (user.profileVisibleTo === "friends of friends" &&
              currentUserIsFriendOfFriend) ||
            (user.profileVisibleTo === "friends" && currentUserIsFriend)
          ) {
            // KEEP THESE, AS THEY'RE USED TO RETURN TOtherUser OBJECT
            const showLocation: boolean =
              user.whoCanSeeLocation === "anyone" ||
              (user.whoCanSeeLocation === "friends" && currentUserIsFriend) ||
              (user.whoCanSeeLocation === "friends of friends" &&
                currentUserIsFriendOfFriend);

            const showPhoneNumber: boolean =
              user.whoCanSeePhoneNumber === "anyone" ||
              (user.whoCanSeePhoneNumber === "friends" && currentUserIsFriend) ||
              (user.whoCanSeePhoneNumber === "friends of friends" &&
                currentUserIsFriendOfFriend);

            const showEmailAddress: boolean =
              user.whoCanSeeEmailAddress === "anyone" ||
              (user.whoCanSeeEmailAddress === "friends" && currentUserIsFriend) ||
              (user.whoCanSeeEmailAddress === "friends of friends" &&
                currentUserIsFriendOfFriend);

            const showInstagram: boolean =
              user.whoCanSeeInstagram === "anyone" ||
              (user.whoCanSeeInstagram === "friends" && currentUserIsFriend) ||
              (user.whoCanSeeInstagram === "friends of friends" &&
                currentUserIsFriendOfFriend);

            const showFacebook: boolean =
              user.whoCanSeeFacebook === "anyone" ||
              (user.whoCanSeeFacebook === "friends" && currentUserIsFriend) ||
              (user.whoCanSeeFacebook === "friends of friends" &&
                currentUserIsFriendOfFriend);

            const showX: boolean =
              user.whoCanSeeX === "anyone" ||
              (user.whoCanSeeX === "friends" && currentUserIsFriend) ||
              (user.whoCanSeeX === "friends of friends" && currentUserIsFriendOfFriend);

            const showFriends: boolean =
              user.whoCanSeeFriendsList === "anyone" ||
              (user.whoCanSeeFriendsList === "friends" && currentUserIsFriend) ||
              (user.whoCanSeeFriendsList === "friends of friends" &&
                currentUserIsFriendOfFriend);
            return {
              "_id": user._id,
              "index": user.index,
              "firstName": user.firstName,
              "lastName": user.lastName,
              "username": user.username,
              "profileImage": user.profileImage,
              "interests": user.interests,
              "about": user.about,
              ...(showLocation && {
                city: user.city,
              }),
              ...(showLocation && {
                stateProvince: user.stateProvince,
              }),
              ...(showLocation && {
                country: user.country,
              }),
              ...(showPhoneNumber && {
                phoneCountry: user.phoneCountry,
              }),
              ...(showPhoneNumber && {
                phoneCountryCode: user.phoneCountryCode,
              }),
              ...(showPhoneNumber && {
                phoneNumberWithoutCountryCode: user.phoneNumberWithoutCountryCode,
              }),
              ...(showEmailAddress && {
                emailAddress: user.emailAddress,
              }),
              ...(showInstagram && {
                instagram: user.instagram,
              }),
              ...(showFacebook && {
                facebook: user.facebook,
              }),
              ...(showX && {
                x: user.x,
              }),
              ...(showFriends && {
                friends: user.friends,
              }),
            };
          }
        });
      }
    }) as Promise<TOtherUser[]>;
  });
};

const getUserByID = (id: string): Promise<Response> => {
  return fetch(`http://localhost:4000/palz/users/${id}`, {
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

// should fetch all other visible users besides currentUser, then filter out based on .whoCanAddUserAsOrganizer
const getPotentialCoOrganizers = (
  eventType: "new" | "edit",
  currentUserID: string | undefined
): Promise<TOtherUser[]> => {
  const url: string = eventType === "new" ? "add-event" : "edit-event";

  return fetch(`http://localhost:4000/palz/users/${url}`, {
    method: "GET",
    redirect: "follow",
  }).then((response) => {
    return response.json().then((allUsers: TUser[]) => {
      if (currentUserID) {
        const otherUsers: TUser[] = allUsers.filter((user) => user._id !== currentUserID);

        const potentialCoOrganizers: TUser[] = otherUsers.filter((otherUser) => {
          if (currentUserID) {
            const currentUserIsFriend: boolean = currentUserID
              ? otherUser.friends.includes(currentUserID)
              : false;

            const currentUserIsFriendOfFriend: boolean = otherUsers.some(
              (user) =>
                user &&
                user._id &&
                currentUserID &&
                otherUser.friends.includes(user._id.toString()) &&
                user.friends.includes(currentUserID)
            );

            const currentUserIsBlocked: boolean =
              otherUser.blockedUsers.includes(currentUserID);

            if (
              !currentUserIsBlocked &&
              (otherUser.whoCanAddUserAsOrganizer === "anyone" ||
                (otherUser.whoCanAddUserAsOrganizer === "friends" &&
                  currentUserIsFriend) ||
                (otherUser.whoCanAddUserAsOrganizer === "friends of friends" &&
                  currentUserIsFriendOfFriend))
            ) {
              return otherUser;
            }
          }
        });

        // Convert each TUser in potentialCoOrganizers array to TOtherUser, and return this array:
        return potentialCoOrganizers.map((otherUser) => {
          const currentUserIsFriend: boolean = currentUserID
            ? otherUser.friends.includes(currentUserID)
            : false;

          const currentUserIsFriendOfFriend: boolean = otherUsers.some(
            (user) =>
              user &&
              user._id &&
              currentUserID &&
              otherUser.friends.includes(user._id.toString()) &&
              user.friends.includes(currentUserID)
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
            "firstName": otherUser.firstName,
            "lastName": otherUser.lastName,
            "username": otherUser.username,
            "profileImage": otherUser.profileImage,
            "interests": otherUser.interests,
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

const getPotentialInvitees = (
  eventType: "new" | "edit",
  currentUserID: string | undefined
): Promise<TOtherUser[]> => {
  const url: string = eventType === "new" ? "add-event" : "edit-event";

  return fetch(`http://localhost:4000/palz/users/${url}`, {
    method: "GET",
    redirect: "follow",
  }).then((response) => {
    return response.json().then((allUsers: TUser[]) => {
      if (currentUserID) {
        const otherUsers: TUser[] = allUsers.filter((user) => user._id !== currentUserID);

        const potentialCoOrganizers: TUser[] = otherUsers.filter((otherUser) => {
          if (currentUserID) {
            const currentUserIsFriend: boolean = currentUserID
              ? otherUser.friends.includes(currentUserID)
              : false;

            const currentUserIsFriendOfFriend: boolean = otherUsers.some(
              (user) =>
                user &&
                user._id &&
                currentUserID &&
                otherUser.friends.includes(user._id.toString()) &&
                user.friends.includes(currentUserID)
            );

            const currentUserIsBlocked: boolean =
              otherUser.blockedUsers.includes(currentUserID);

            if (
              !currentUserIsBlocked &&
              (otherUser.whoCanInviteUser === "anyone" ||
                (otherUser.whoCanInviteUser === "friends" && currentUserIsFriend) ||
                (otherUser.whoCanInviteUser === "friends of friends" &&
                  currentUserIsFriendOfFriend))
            ) {
              return otherUser;
            }
          }
        });

        // Convert each TUser in potentialCoOrganizers array to TOtherUser, and return this array:
        return potentialCoOrganizers.map((otherUser) => {
          const currentUserIsFriend: boolean = currentUserID
            ? otherUser.friends.includes(currentUserID)
            : false;

          const currentUserIsFriendOfFriend: boolean = otherUsers.some(
            (user) =>
              user &&
              user._id &&
              currentUserID &&
              otherUser.friends.includes(user._id.toString()) &&
              user.friends.includes(currentUserID)
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
            "firstName": otherUser.firstName,
            "lastName": otherUser.lastName,
            "username": otherUser.username,
            "profileImage": otherUser.profileImage,
            "interests": otherUser.interests,
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

const addToBlockedUsers = (
  blocker: TUser,
  blockeeID: string | undefined
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedBlockedUsersArray = blockeeID ? blocker.blockedUsers.concat(blockeeID) : "";

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

const removeFromBlockedUsers = (blocker: TUser, blockeeID: string): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedBlockedUsersArray = blocker.blockedUsers.filter(
    (userID) => userID !== blockeeID
  );

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

  const updatedInterestedUsersArray: Array<string> = [];
  for (const intUser of event.interestedUsers) {
    updatedInterestedUsersArray.push(intUser);
  }
  if (user && user._id) {
    updatedInterestedUsersArray.push(user._id.toString());
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
    updatedDisinterestedUsersArray.push(user?._id?.toString());
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

const deleteUserRSVP = (user: TUser | TOtherUser | null, event: TEvent) => {
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

const removeInvitee = (
  event: TEvent,
  user: TUser | TOtherUser | null
): Promise<Response> => {
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
  event: TEvent,
  user: TUser | TOtherUser | null
): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "organizers": event.organizers.filter((id) => id !== user?._id),
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

  const updatedFriendRequestsReceivedArray = [
    ...recipient.friendRequestsReceived,
    sender._id,
  ];

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

const addToFriendRequestsSent = (sender: TUser, recipient: TUser): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let updatedFriendRequestsSentArray = [...sender.friendRequestsSent, recipient._id];

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
  sender: TOtherUser,
  recipient: TUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const getRaw = () => {
    return JSON.stringify({
      "friendRequestsReceived": recipient?.friendRequestsReceived.filter(
        (id) => id !== sender._id
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
  recipient: TOtherUser
): Promise<Response> => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const updatedFriendRequestsArray = sender.friendRequestsSent.filter(
    (id) => id !== recipient._id
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
      newChat.chatName.replace(/\s/g, "") !== "" && { newChat: newChat.chatName }),
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
