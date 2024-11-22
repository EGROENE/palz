// @ts-nocheck
import { TEvent } from "./types";

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
