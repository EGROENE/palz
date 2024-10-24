import { TEvent } from "./types";

const arraysAreIdentical = (_arr1: any[], _arr2: any[]) => {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
    return false;
  }

  // .concat() to not mutate arguments
  const arr1 = _arr1.concat().sort();
  const arr2 = _arr2.concat().sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
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
  input.replace(/[^a-zÄäÖöÜüÑñÉéóÓÍí -]/gi, "");

const getCapitalizedWord = (word: string | undefined): string => {
  const wordLetters = word?.split("");
  const firstLetterCapitalized = wordLetters ? wordLetters[0]?.toUpperCase() : "";
  const otherLettersJoined = wordLetters?.slice(1).join("").toLowerCase();

  return firstLetterCapitalized + otherLettersJoined;
};

const formatCapitalizedName = (string: string | undefined): string => {
  let formattedWordOrWords = "";

  if (string !== "") {
    if (string?.includes("-")) {
      const stringWords: string[] = string.split(/[\s-]+/);
      for (const word of stringWords) {
        const trimmedWord = word.trim();
        const capitalizedWord = getCapitalizedWord(trimmedWord);
        // If char before/after word in original string is hyphen, separator should be "-"; else, " ":
        const stringNoMultiSpacesSplitBySpaces = string
          .replace(/\s+/g, " ")
          .split(" ")[0];
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
    } else if (string?.includes(" ")) {
      const stringWords: string[] = string.replace(/\s+/g, " ").split(" ");
      for (const word of stringWords) {
        const trimmedWord = word.trim();
        const capitalizedWord = getCapitalizedWord(trimmedWord);
        formattedWordOrWords =
          formattedWordOrWords !== ""
            ? formattedWordOrWords + " " + capitalizedWord
            : capitalizedWord;
      }
    } else {
      const capitalizedWord = getCapitalizedWord(string);
      formattedWordOrWords =
        formattedWordOrWords !== ""
          ? formattedWordOrWords + " " + capitalizedWord
          : capitalizedWord;
    }
  }
  return (
    formattedWordOrWords
      // .replace(/\undefined/g, "") // Formerly, this was used, but there was an error. So far, .replace(/undefined/g, "") seems to work.
      .replace(/undefined/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
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

const Methods = {
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
