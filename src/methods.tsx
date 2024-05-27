const getCapitalizedWord = (word: string | undefined): string => {
  const wordLetters = word?.split("");
  const firstLetterCapitalized = wordLetters ? wordLetters[0]?.toUpperCase() : "";
  const otherLettersJoined = wordLetters?.slice(1).join("").toLowerCase();

  return firstLetterCapitalized + otherLettersJoined;
};

const formatName = (string: string | undefined): string => {
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

const cleanName = (name: string): string => {
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
  return finalChars.join("");
};

const Methods = {
  getCapitalizedWord,
  formatName,
  cleanName,
};
export default Methods;
