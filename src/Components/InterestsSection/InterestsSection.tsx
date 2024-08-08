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
};

const InterestsSection = ({
  randomColor,
  interestsRelation,
  currentEvent,
  newEventInterests,
  handleAddInterest,
  handleRemoveInterest,
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
  /* Users can add interests to an existing event (on EditEventForm), a new event (on AddEventForm), or to their own profile (on UserSettings). These conditions are handled respectively in function below. */
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

  useEffect(() => {
    setDisplayedAdditionalInterests(addableInterests);
  }, []);

  useEffect(() => {
    /* Somehow, if user inputs an interest, currentUser?.interests changes, so only set displayedAdditionalInterests to allInterestsNotOnCurrentUser if inputInterest === "". This ensures displayedAdditionalInterests updates as soon as user adds/deletes interest */
    if (inputInterest === "") {
      setDisplayedAdditionalInterests(addableInterests);
    }
  }, [currentUser?.interests]);

  return (
    <div className="interests-section">
      <p>
        {interestsRelation === "user" ? "Interests: " : "Related Interests: "}
        <span
          style={{ "color": randomColor }}
          className="show-module"
          onClick={() => setShowInterestsModal(!showInterestsModal)}
        >
          Browse
        </span>
      </p>
      <div className="interests-container">
        {savedInterests?.length ? (
          Methods.getStringArraySortedAlphabetically(savedInterests)?.map((interest) => (
            <span className="tab" key={interest} style={{ backgroundColor: randomColor }}>
              {interest}

              <i
                title="Remove"
                onClick={(e) => handleRemoveInterest(interest, e)}
                className="fas fa-times"
              ></i>
            </span>
          ))
        ) : (
          <p>Click 'browse' to add some interests!</p>
        )}
      </div>
      {/* 2 possibilities for addableInterests prop in InterestsModal below due to setting state of displayedAdditionalInterests in getAddableInterests in the 3 possible conditions resulting in too many re-renders (more-flexible addableInterests used in the case of event interests, while displayedAdditionalInterests is used in the case of user interests). Also, having a single state value for this would require several convoluted useEffects. In the end, displayed saved/addable interests should update as user add/deletes these from the saved interests, plus the addable interests should be filtered, based on what user inputs in InterestsModal; both of these things are possible now. */}
      {showInterestsModal && (
        <InterestsModal
          addableInterests={
            interestsRelation === "user" ? displayedAdditionalInterests : addableInterests
          }
          handleClearAddInterestInput={handleClearAddInterestInput}
          setShowInterestsModal={setShowInterestsModal}
          inputInterest={inputInterest}
          setInputInterest={setInputInterest}
          inputInterestsHandler={handleInterestsInput}
          handleAddInterest={handleAddInterest}
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
