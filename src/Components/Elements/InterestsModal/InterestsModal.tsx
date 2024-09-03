import Methods from "../../../methods";
import { TThemeColor } from "../../../types";
import SearchBar from "../SearchBar/SearchBar";
import Tab from "../Tab/Tab";
import styles from "./styles.module.css";

/* Returns a modal wherein user can see a bunch of tabs, each of which represent an interest & a '+', which adds interest to certain array. There is also a search bar that can be used to find interests or type in a nonexistent interest to be added. */
const InterestsModal = ({
  displayedAdditionalInterests,
  handleClearAddInterestInput,
  setShowInterestsModal,
  inputInterest,
  handleInterestsInput,
  handleAddInterest,
  noAdditionalInterestsAndInputInterest,
  noAdditionalInterestsAndNoInputInterest,
  disableAddInterestsButton,
  randomColor,
  interestsRelation,
}: {
  displayedAdditionalInterests: string[];
  handleClearAddInterestInput: () => void;
  setShowInterestsModal: (value: React.SetStateAction<boolean>) => void;
  inputInterest: string;
  handleInterestsInput: (input: string) => void;
  handleAddInterest: (
    interest: string,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  noAdditionalInterestsAndInputInterest: boolean;
  noAdditionalInterestsAndNoInputInterest: boolean;
  disableAddInterestsButton: boolean;
  randomColor?: TThemeColor;
  interestsRelation: "event" | "user";
}) => {
  return (
    <div className={styles.modalBackground}>
      <i
        title="Close"
        onClick={() => {
          setShowInterestsModal(false);
          handleInterestsInput("");
        }}
        className="fas fa-times close-module-icon"
      ></i>
      <div className={styles.browseInterestsModal}>
        <div className={styles.barAndDescription}>
          <p>Don't see an interest listed? Type it below & add it:</p>
          <SearchBar
            input={inputInterest}
            placeholder="Type an interest"
            inputHandler={handleInterestsInput}
            clearInputHandler={handleClearAddInterestInput}
            isSideButton={true}
            sideButtonText="Add"
            sideButtonIsDisabled={disableAddInterestsButton}
            addMethod={handleAddInterest}
            randomColor={randomColor}
          />
        </div>
        <div className={styles.nonUserInterestsContainer}>
          {!noAdditionalInterestsAndNoInputInterest &&
            !noAdditionalInterestsAndInputInterest &&
            Methods.getStringArraySortedAlphabetically(displayedAdditionalInterests).map(
              (interest) => (
                <Tab
                  info={interest}
                  key={interest}
                  addHandler={handleAddInterest}
                  randomColor={randomColor}
                />
              )
            )}
          {noAdditionalInterestsAndNoInputInterest && interestsRelation === "user" && (
            <p>Type in an interest of yours & add it!</p>
          )}
          {noAdditionalInterestsAndNoInputInterest && interestsRelation === "event" && (
            <p>Type in an interest relating to this event & add it!</p>
          )}

          {noAdditionalInterestsAndInputInterest && (
            <p>No matching interests exist, but you can add what you typed!</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default InterestsModal;
