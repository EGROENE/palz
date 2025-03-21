// @ts-nocheck
import { TEvent, TUser, TChat } from "./types";

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

const arraysAreIdentical = (array1: any[], array2: any[]) => {
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

const nameNoSpecialChars = (input: string) =>
  input.replace(/[^a-zÄäÖöÜüÑñÉéóÓÍí -']/gi, "");

const getCapitalizedWord = (word) => {
  const firstLetterCapitalized = word && word[0].toUpperCase();
  const restOfWord = word.slice(1);
  return firstLetterCapitalized + restOfWord;
};

const formatCapitalizedName = (name) => {
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

// To avoid BS type errors & keep this method usable w/ arrays of all types, disable type checking
// @ts-ignore
function removeDuplicatesFromArray(arr: any[]) {
  // @ts-ignore
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

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
  getDateMessageSent,
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
