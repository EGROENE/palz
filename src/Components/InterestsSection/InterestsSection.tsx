import { useState, useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { TEvent } from "../../types";
import Methods from "../../methods";
import InterestsModal from "../InterestsModal/InterestsModal";

type InterestsSectionProps = {
  randomColor: string;
  interestsRelation: "event" | "user";
  currentEvent?: TEvent;
  newEventInterests?: string[];
  handleAddInterest: (
    interest: string,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void | ((interest: string) => void);
  handleRemoveInterest: (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  isDisabled: boolean;
};

const InterestsSection = ({
  randomColor,
  interestsRelation,
  currentEvent,
  newEventInterests,
  handleAddInterest,
  handleRemoveInterest,
  isDisabled,
}: InterestsSectionProps) => {
  const [showInterestsModal, setShowInterestsModal] = useState<boolean>(false);

  const [displayedAdditionalInterests, setDisplayedAdditionalInterests] = useState<
    string[]
  >([]);

  const [inputInterest, setInputInterest] = useState<string>("");

  const noAdditionalInterestsAndInputInterest =
    displayedAdditionalInterests.length === 0 && inputInterest !== "";

  const noAdditionalInterestsAndNoInputInterest =
    displayedAdditionalInterests.length === 0 && inputInterest === "";

  const disableAddInterestsButton =
    (displayedAdditionalInterests.length === 1 &&
      inputInterest === displayedAdditionalInterests[0]) ||
    inputInterest === "";

  const { currentUser, allUsers, allEvents } = useMainContext();

  // Get array of interests that are not present on user/event object
  // This will be passed to InterestsModal; for each item in array, an addable interest displays
  /* Users can add interests to an existing event (on EditEventPage), a new event (on AddEventPage), or to their own profile (on UserSettings). These conditions are handled respectively in function below. */
  const getAddableInterests = (): string[] => {
    const allUserInterests: string[] = Methods.removeDuplicatesFromArray(
      allUsers.map((user) => user.interests).flat()
    );
    const allEventInterests: string[] = Methods.removeDuplicatesFromArray(
      allEvents.map((event) => event.relatedInterests).flat()
    );

    if (interestsRelation === "event" && currentEvent) {
      // In the case of editing an already-existing event:
      // Returns allOtherEventInterests + allUserInterests - interests that exist on currentEvent
      const allOtherEventInterests: string[] = Methods.removeDuplicatesFromArray(
        allEvents
          .filter((ev) => ev.id !== currentEvent?.id)
          .map((ev) => ev.relatedInterests)
          .flat()
          .filter((int) => !currentEvent.relatedInterests.includes(int))
      );
      return Methods.removeDuplicatesFromArray(
        allOtherEventInterests.concat(allUserInterests)
      );
    } else if (interestsRelation === "event") {
      // In the case of adding interests to new event...
      // returns allUserInterests + allEventInterests - events that exist on newEventInterests
      return Methods.removeDuplicatesFromArray(
        allUserInterests
          .concat(allEventInterests)
          .filter((int) => !newEventInterests?.includes(int))
      );
    }
    // Default case; if updating user interests:
    // Returns allOtherUserInterests + allEventInterests - interests that exist on currentUser
    const allOtherUserInterests: string[] = Methods.removeDuplicatesFromArray(
      allUsers
        .filter((user) => user.username !== currentUser?.username)
        .map((user) => user.interests)
        .flat()
    );
    return Methods.removeDuplicatesFromArray(
      allOtherUserInterests
        .concat(allEventInterests)
        .filter((int) => !currentUser?.interests.includes(int))
    );
  };
  const addableInterests = getAddableInterests();

  // Get array of interests that exist on user/event object, whether event is being edited or added (interests on user obj are always edited)
  const getSavedInterests = () => {
    if (interestsRelation === "user") {
      return currentUser?.interests;
    } else if (currentEvent && interestsRelation === "event") {
      return currentEvent.relatedInterests;
    }
    return newEventInterests;
  };
  const savedInterests = getSavedInterests();

  // HANDLERS
  const handleInterestsInput = (input: string): void => {
    const inputCaseInsensitive = input
      .replace(/[^a-z0-9ÄäÖöÜüÑñÉéóÓÍí -]/gi, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    setInputInterest(inputCaseInsensitive);
    if (inputCaseInsensitive.trim() === "") {
      setDisplayedAdditionalInterests(addableInterests);
    } else {
      const addableInterests = getAddableInterests(); // get updated addableInterests
      for (const interest of addableInterests) {
        if (interest === inputCaseInsensitive.trim()) {
          setDisplayedAdditionalInterests(
            addableInterests.filter((int) => int === inputCaseInsensitive.trim())
          );
        } else {
          setDisplayedAdditionalInterests(
            addableInterests.filter((int) => int.includes(inputCaseInsensitive.trim()))
          );
        }
      }
    }
  };

  const handleClearAddInterestInput = (): void => {
    setInputInterest("");
    setDisplayedAdditionalInterests(addableInterests);
  };

  /* Create new add-interest handler that makes appropriate request in method passed to prop handleAddInterest, clears interest-input field if it's not empty (displaying all non-saved interests again), & updates all non-saved interests after user adds a particular interest */
  const addInterestHandler = (
    interest: string,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    handleAddInterest(interest, e);
    if (inputInterest.trim() !== "") {
      handleClearAddInterestInput();
    }
    setDisplayedAdditionalInterests(getAddableInterests());
  };

  useEffect(() => {
    setDisplayedAdditionalInterests(addableInterests);
  }, []);

  useEffect(() => {
    /* Ensure that, whenever current-user/event interests or newEventInterests change, & inputInterest if empty string (which is always the case, whether b/c InterestModal isn't rendered, user hasn't input anything, or it was cleared after user input something & then added an interest), displayedAdditionalInterests is updated. */
    if (inputInterest === "") {
      setDisplayedAdditionalInterests(addableInterests);
    }
  }, [currentUser?.interests, currentEvent?.relatedInterests, newEventInterests]);

  return (
    <div className="interests-section">
      <p>
        {interestsRelation === "user" ? "Interests: " : "Related Interests: "}
        {!isDisabled && (
          <span
            style={{ "color": randomColor }}
            className="show-module"
            onClick={() => setShowInterestsModal(!showInterestsModal)}
          >
            Browse
          </span>
        )}
      </p>
      <div className="interests-container">
        {savedInterests?.length ? (
          Methods.getStringArraySortedAlphabetically(savedInterests)?.map((interest) => (
            <span
              className={isDisabled ? "tab disabled" : "tab"}
              key={interest}
              style={{ backgroundColor: randomColor }}
            >
              {interest}

              <i
                title="Remove"
                onClick={(e) =>
                  !isDisabled ? handleRemoveInterest(interest, e) : undefined
                }
                className="fas fa-times"
              ></i>
            </span>
          ))
        ) : (
          <p>Click 'browse' to add some interests!</p>
        )}
      </div>
      {showInterestsModal && (
        <InterestsModal
          displayedAdditionalInterests={displayedAdditionalInterests}
          handleClearAddInterestInput={handleClearAddInterestInput}
          setShowInterestsModal={setShowInterestsModal}
          inputInterest={inputInterest}
          setInputInterest={setInputInterest}
          inputInterestsHandler={handleInterestsInput}
          handleAddInterest={addInterestHandler}
          noAdditionalInterestsAndInputInterest={noAdditionalInterestsAndInputInterest}
          noAdditionalInterestsAndNoInputInterest={
            noAdditionalInterestsAndNoInputInterest
          }
          disableAddInterestsButton={disableAddInterestsButton}
          randomColor={randomColor}
          interestsRelation={interestsRelation}
        />
      )}
    </div>
  );
};
export default InterestsSection;
