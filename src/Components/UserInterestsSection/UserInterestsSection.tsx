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
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void | ((interest: string) => void);
  handleRemoveInterest: (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
};

const UserInterestsSection = ({
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
    displayedAdditionalInterests.length === 1 &&
    inputInterest === displayedAdditionalInterests[0];

  const { currentUser, allUsers, allEvents } = useMainContext();

  // Get array of interests that are not present on user/event object
  const getAllOtherInterestsNotOnCurrentObject = (): string[] => {
    if (interestsRelation === "user") {
      const allOtherUserInterests = allUsers
        .filter((user) => user.username !== currentUser?.username)
        .map((user) => user.interests)
        .flat();
      return Methods.removeDuplicates(
        allOtherUserInterests.filter((int) => !currentUser?.interests.includes(int))
      );
    } else if (currentEvent && interestsRelation === "event") {
      const allOtherEventInterests = allEvents
        .filter((ev) => ev.id !== currentEvent?.id)
        .map((ev) => ev.relatedInterests)
        .flat();
      return Methods.removeDuplicates(
        allOtherEventInterests.filter(
          (int) => !currentEvent?.relatedInterests.includes(int)
        )
      );
    } else {
      // In the case of adding interests on a AddEventForm...
      // cannot include interests user has already added to the new event
      return Methods.removeDuplicates(
        allEvents
          .filter((ev) => ev.relatedInterests.length > 0)
          .map((ev: TEvent) => ev.relatedInterests)
          .flat()
          .filter((int) => !newEventInterests?.includes(int))
      );
    }
  };
  const allOtherInterestsNotOnCurrentObject = getAllOtherInterestsNotOnCurrentObject();

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
      setDisplayedAdditionalInterests(allOtherInterestsNotOnCurrentObject);
    } else {
      for (const interest of allOtherInterestsNotOnCurrentObject) {
        if (interest === inputCaseInsensitive.trim()) {
          setDisplayedAdditionalInterests(
            allOtherInterestsNotOnCurrentObject.filter(
              (int) => int === inputCaseInsensitive.trim()
            )
          );
        } else {
          setDisplayedAdditionalInterests(
            allOtherInterestsNotOnCurrentObject.filter((int) =>
              int.includes(inputCaseInsensitive.trim())
            )
          );
        }
      }
    }
  };

  // Define or get as prop updateEventInterests, including a Request to update in DB for when this comp is used on EditEventForm

  useEffect(() => {
    setDisplayedAdditionalInterests(allOtherInterestsNotOnCurrentObject);
  }, []);

  useEffect(() => {
    /* Somehow, if user inputs an interest, currentUser?.interests changes, so only set displayedAdditionalInterests to allInterestsNotOnCurrentUser if inputInterest === "". This ensures displayedAdditionalInterests updates as soon as user adds/deletes interest */
    if (inputInterest === "") {
      setDisplayedAdditionalInterests(allOtherInterestsNotOnCurrentObject);
    }
  }, [currentUser?.interests]);

  useEffect(() => {
    /* Somehow, if user inputs an interest, currentUser?.interests changes, so only set displayedAdditionalInterests to allInterestsNotOnCurrentUser if inputInterest === "". This ensures displayedAdditionalInterests updates as soon as user adds/deletes interest */
    if (inputInterest === "") {
      setDisplayedAdditionalInterests(allOtherInterestsNotOnCurrentObject);
    }
  }, [currentEvent?.relatedInterests]);

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
          savedInterests?.map((interest) => (
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
      {showInterestsModal && (
        <InterestsModal
          displayedInterests={allOtherInterestsNotOnCurrentObject}
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
        />
      )}
    </div>
  );
};
export default UserInterestsSection;
