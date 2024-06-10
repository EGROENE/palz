import { TEvent } from "./types";

const sortEventsSoonestToLatest = (eventArray: TEvent[]): TEvent[] =>
  eventArray.sort((a, b) => a.nextEventTime - b.nextEventTime);

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
  return formattedWordOrWords
    .replace(/\undefined/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
function removeDuplicates(arr) {
  // @ts-ignore
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

const Methods = {
  sortEventsSoonestToLatest,
  isValidUrl,
  nameNoSpecialChars,
  getCapitalizedWord,
  formatCapitalizedName,
  formatHyphensAndSpacesInString,
  removeDuplicates,
};
export default Methods;
