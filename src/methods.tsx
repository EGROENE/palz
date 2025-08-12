// @ts-nocheck
import { TEvent, TUser, TChat, TUserSecure, TBarebonesUser } from "./types";

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

const isTUserSecure = (value: any): value is TUserSecure => {
  return value.username ? true : false;
};

const isTBarebonesUser = (value: any): value is TBarebonesUser => {
  return value.username ? true : false;
};

const arraysAreIdentical = (array1: any[], array2: any[]): boolean =>
  array1.sort().join(",") === array2.sort().join(",") ? true : false;

const sortEventsSoonestToLatest = (eventArray: TEvent[]): TEvent[] =>
  eventArray.sort((a, b) => a.eventStartDateTimeInMS - b.eventStartDateTimeInMS);

// Function to check if URL is valid
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

const nameNoSpecialChars = (input: string): string =>
  input.replace(/[^a-zA-ZÄäÖöÜüÑñÉéóÓÍí \-']/gi, "");

const getCapitalizedWord = (word): string => {
  const firstLetterCapitalized = word && word[0].toUpperCase();
  const restOfWord = word.slice(1);
  return firstLetterCapitalized + restOfWord;
};

const formatCapitalizedName = (name): string => {
  let formattedWordOrWords = "";

  if (name !== "") {
    if (name?.includes("-")) {
      const stringWords: string[] = name.split(/[\s-]+/);
      for (const word of stringWords) {
        const trimmedWord = word.trim();
        const capitalizedWord = getCapitalizedWord(trimmedWord);
        // If char before/after word in original string is hyphen, separator should be "-"; else, " ":
        const stringNoMultiSpacesSplitBySpaces = name.replace(/\s+/g, " ").split(" ")[0];
        const indexOfWordInStringNoMultiSpacesSplitBySpaces =
          stringNoMultiSpacesSplitBySpaces.indexOf(word);
        const prevItemIndex = indexOfWordInStringNoMultiSpacesSplitBySpaces - 1;
        const nextItemIndex = indexOfWordInStringNoMultiSpacesSplitBySpaces + 1;
        const separator =
          stringNoMultiSpacesSplitBySpaces[prevItemIndex] === "-" ||
          stringNoMultiSpacesSplitBySpaces[nextItemIndex] === "-"
            ? "-"
            : " ";
        formattedWordOrWords =
          formattedWordOrWords !== ""
            ? formattedWordOrWords + separator + capitalizedWord
            : capitalizedWord;
      }
    } else if (name?.includes(" ")) {
      const stringWords: string[] = name.replace(/\s+/g, " ").split(" ");
      for (const word of stringWords) {
        const trimmedWord = word.trim();
        const capitalizedWord = getCapitalizedWord(trimmedWord);
        formattedWordOrWords =
          formattedWordOrWords !== ""
            ? formattedWordOrWords + " " + capitalizedWord
            : capitalizedWord;
      }
    } else {
      formattedWordOrWords = getCapitalizedWord(name);
    }
  }
  return formattedWordOrWords.replace(/\s+/g, " ").trim();
};

const formatHyphensAndSpacesInString = (name: string): string => {
  let finalChars = [];
  for (let i = 0; i < name.split("").length; i++) {
    const currentChar = name[i];
    const prevChar = name[i - 1];
    const nextChar = name[i + 1];
    if (
      (currentChar === " " && prevChar !== " " && prevChar !== "-" && nextChar !== "-") ||
      (currentChar === "-" && prevChar !== "-" && prevChar !== "-") ||
      (currentChar !== " " && currentChar !== "-")
    ) {
      finalChars.push(currentChar);
    }
  }
  // Exlude first or last character if it's a hyphen or space
  if (finalChars[0] === " " || finalChars[0] === "-") {
    finalChars = finalChars.slice(1);
  }
  if (
    finalChars[finalChars.length - 1] === " " ||
    finalChars[finalChars.length - 1] === "-"
  ) {
    finalChars = finalChars.slice(0, finalChars.length - 1);
  }
  return finalChars.join("");
};

const removeDuplicatesFromArray = (arr: any[]): any[] => [...new Set(arr)];

const getTUserSecureFromTUser = (
  userToConvert: TUser,
  currentUser: TUser
): TUserSecure => {
  const currentUserIsFriend: boolean =
    currentUser && currentUser._id
      ? userToConvert.friends.includes(currentUser._id.toString())
      : false;

  const currentUserIsFriendOfFriend: boolean = userToConvert.friends.some((pfFriend) =>
    currentUser.friends.includes(pfFriend)
  );

  const showLocation: boolean =
    userToConvert.whoCanSeeLocation === "anyone" ||
    (userToConvert.whoCanSeeLocation === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeeLocation === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  const showPhoneNumber: boolean =
    userToConvert.whoCanSeePhoneNumber === "anyone" ||
    (userToConvert.whoCanSeePhoneNumber === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeePhoneNumber === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  const showEmailAddress: boolean =
    userToConvert.whoCanSeeEmailAddress === "anyone" ||
    (userToConvert.whoCanSeeEmailAddress === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeeEmailAddress === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  const showInstagram: boolean =
    userToConvert.whoCanSeeInstagram === "anyone" ||
    (userToConvert.whoCanSeeInstagram === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeeInstagram === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  const showFacebook: boolean =
    userToConvert.whoCanSeeFacebook === "anyone" ||
    (userToConvert.whoCanSeeFacebook === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeeFacebook === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  const showX: boolean =
    userToConvert.whoCanSeeX === "anyone" ||
    (userToConvert.whoCanSeeX === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeeX === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  const showFriends: boolean =
    userToConvert.whoCanSeeFriendsList === "anyone" ||
    (userToConvert.whoCanSeeFriendsList === "friends" && currentUserIsFriend) ||
    (userToConvert.whoCanSeeFriendsList === "friends of friends" &&
      (currentUserIsFriendOfFriend || currentUserIsFriend));

  return {
    "_id": userToConvert._id,
    "index": userToConvert.index,
    "firstName": userToConvert.firstName,
    "lastName": userToConvert.lastName,
    "username": userToConvert.username,
    "profileImage": userToConvert.profileImage,
    "interests": userToConvert.interests,
    "about": userToConvert.about,
    ...(showLocation && {
      city: userToConvert.city,
    }),
    ...(showLocation && {
      stateProvince: userToConvert.stateProvince,
    }),
    ...(showLocation && {
      country: userToConvert.country,
    }),
    ...(showPhoneNumber && {
      phoneCountry: userToConvert.phoneCountry,
    }),
    ...(showPhoneNumber && {
      phoneCountryCode: userToConvert.phoneCountryCode,
    }),
    ...(showPhoneNumber && {
      phoneNumberWithoutCountryCode: userToConvert.phoneNumberWithoutCountryCode,
    }),
    ...(showEmailAddress && {
      emailAddress: userToConvert.emailAddress,
    }),
    ...(showInstagram && {
      instagram: userToConvert.instagram,
    }),
    ...(showFacebook && {
      facebook: userToConvert.facebook,
    }),
    ...(showX && {
      x: userToConvert.x,
    }),
    ...(showFriends && {
      friends: userToConvert.friends,
    }),
  };
};

// TBarebonesUser is only included as param, since a value of type, say TUserSecure | TBarebonesUser could be passed
const getTBarebonesUser = (
  user: TUser | TUserSecure | TBarebonesUser | null
): TBarebonesUser => {
  return {
    _id: user?._id,
    username: user?.username,
    firstName: user?.firstName,
    lastName: user?.lastName,
    emailAddress: user?.emailAddress,
    profileImage: user?.profileImage,
    index: user?.index,
  };
};

const getStringArraySortedAlphabetically = (array: string[]): string[] => {
  return array.sort(function (a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
};

const convertToBase64 = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

const sortChatsByMostRecentMessage = (chats: TChat[]): TChat[] => {
  let newChats: TChat[] = [];
  let lastActivityTimes: number[] = [];
  for (const chat of chats) {
    if (chat.messages.length > 0) {
      lastActivityTimes.push(chat.messages[chat.messages.length - 1].timeSent);
    } else {
      lastActivityTimes.push(chat.dateCreated);
    }
  }
  const lastActivityTimesSortedMostRecent = lastActivityTimes.sort((a, b) => b - a);

  let sortedChats: TChat[] = [];
  for (const lastActivityTime of lastActivityTimesSortedMostRecent) {
    for (const chat of chats) {
      if (
        chat.messages.length > 0 &&
        chat.messages[chat.messages.length - 1].timeSent === lastActivityTime
      ) {
        sortedChats.push(chat);
      }
      if (chat.messages.length === 0 && chat.dateCreated === lastActivityTime) {
        sortedChats.push(chat);
      }
    }
  }
  return newChats.concat(sortedChats);
};

const getDateMessageSent = (message: TMessage): string => {
  const now = Date.now();
  const timeOfMostRecentMessage = message.timeSent;
  const timeElapsed = now - timeOfMostRecentMessage;
  const dateOfLastMessage = new Date(timeOfMostRecentMessage);

  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = oneDay * 7;
  const oneYear = oneDay * 365;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (timeElapsed < oneDay) {
    return dateOfLastMessage.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (timeElapsed > oneDay && timeElapsed < oneWeek) {
    const dayOfWeek = dateOfLastMessage.getDay();
    return days[dayOfWeek];
  }
  if (timeElapsed > oneWeek && timeElapsed < oneYear) {
    return months[dateOfLastMessage.getMonth()] + " " + dateOfLastMessage.getDate();
  }
  return (
    months[dateOfLastMessage.getMonth()] +
    " " +
    dateOfLastMessage.getDate() +
    " " +
    dateOfLastMessage.getFullYear()
  );
};

const Methods = {
  isTBarebonesUser,
  getTUserSecureFromTUser,
  getTBarebonesUser,
  getDateMessageSent,
  isTUserSecure,
  sortChatsByMostRecentMessage,
  isTEvent,
  isTUser,
  convertToBase64,
  arraysAreIdentical,
  sortEventsSoonestToLatest,
  isValidUrl,
  nameNoSpecialChars,
  getCapitalizedWord,
  formatCapitalizedName,
  formatHyphensAndSpacesInString,
  removeDuplicatesFromArray,
  getStringArraySortedAlphabetically,
};
export default Methods;
