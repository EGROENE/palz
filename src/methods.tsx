// @ts-nocheck
import { TEvent, TUser, TChat, TOtherUser } from "./types";

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

const isTOtherUser = (value: any): value is TOtherUser => {
  return value.username ? true : false;
};

const arraysAreIdentical = (array1: any[], array2: any[]): boolean => {
  if (array1.sort().join(",") === array2.sort().join(",")) {
    return true;
  }
  return false;
};

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

const getTOtherUserFromTUser = (user: TUser): TOtherUser => {
  const currentUserIsFriend: boolean =
    currentUser && currentUser._id
      ? user.friends.includes(currentUser._id.toString())
      : false;

  const currentUserIsFriendOfFriend: boolean = user.friends.some((pfFriend) => {
    if (currentUser && currentUser.friends.includes(pfFriend)) {
      return true;
    }
    return false;
  });

  const showLocation: boolean =
    user.whoCanSeeLocation === "anyone" ||
    (user.whoCanSeeLocation === "friends" && currentUserIsFriend) ||
    (user.whoCanSeeLocation === "friends of friends" && currentUserIsFriendOfFriend);

  const showPhoneNumber: boolean =
    user.whoCanSeePhoneNumber === "anyone" ||
    (user.whoCanSeePhoneNumber === "friends" && currentUserIsFriend) ||
    (user.whoCanSeePhoneNumber === "friends of friends" && currentUserIsFriendOfFriend);

  const showEmailAddress: boolean =
    user.whoCanSeeEmailAddress === "anyone" ||
    (user.whoCanSeeEmailAddress === "friends" && currentUserIsFriend) ||
    (user.whoCanSeeEmailAddress === "friends of friends" && currentUserIsFriendOfFriend);

  const showInstagram: boolean =
    user.whoCanSeeInstagram === "anyone" ||
    (user.whoCanSeeInstagram === "friends" && currentUserIsFriend) ||
    (user.whoCanSeeInstagram === "friends of friends" && currentUserIsFriendOfFriend);

  const showFacebook: boolean =
    user.whoCanSeeFacebook === "anyone" ||
    (user.whoCanSeeFacebook === "friends" && currentUserIsFriend) ||
    (user.whoCanSeeFacebook === "friends of friends" && currentUserIsFriendOfFriend);

  const showX: boolean =
    user.whoCanSeeX === "anyone" ||
    (user.whoCanSeeX === "friends" && currentUserIsFriend) ||
    (user.whoCanSeeX === "friends of friends" && currentUserIsFriendOfFriend);

  const showFriends: boolean =
    user.whoCanSeeFriendsList === "anyone" ||
    (user.whoCanSeeFriendsList === "friends" && currentUserIsFriend) ||
    (user.whoCanSeeFriendsList === "friends of friends" && currentUserIsFriendOfFriend);

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
};

// TBarebonesUser is only included as param, since a value of type, say TOtherUser | TBarebonesUser could be passed
const getTBarebonesUser = (
  user: TUser | TOtherUser | TBarebonesUser | null
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
  getTOtherUserFromTUser,
  getTBarebonesUser,
  getDateMessageSent,
  isTOtherUser,
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
