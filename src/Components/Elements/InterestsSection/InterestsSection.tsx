import { useState, useEffect } from "react";
import { TEvent, TOtherUser, TThemeColor } from "../../../types";
import Methods from "../../../methods";
import InterestsModal from "../InterestsModal/InterestsModal";
import Tab from "../Tab/Tab";
import styles from "./styles.module.css";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";

type InterestsSectionProps = {
  randomColor: TThemeColor | undefined;
  interestsRelation: "event" | "user";
  currentEvent?: TEvent;
  newEventInterests?: string[];
  handleAddInterest: (
    interest: string,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
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
    displayedAdditionalInterests &&
    displayedAdditionalInterests.length === 0 &&
    inputInterest !== "";

  const noAdditionalInterestsAndNoInputInterest =
    displayedAdditionalInterests &&
    displayedAdditionalInterests.length === 0 &&
    inputInterest === "";

  const disableAddInterestsButton =
    (displayedAdditionalInterests &&
      displayedAdditionalInterests.length === 1 &&
      inputInterest === displayedAdditionalInterests[0]) ||
    inputInterest === "";

  const { currentUser, fetchAllVisibleOtherUsersQuery } = useUserContext();

  const otherVisibleUsers: TOtherUser[] | undefined = fetchAllVisibleOtherUsersQuery.data;

  const { fetchAllEventsQuery } = useEventContext();

  const allEvents = fetchAllEventsQuery.data;

  // Get array of interests that are not present on user/event object
  // This will be passed to InterestsModal; for each item in array, an addable interest displays
  /* Users can add interests to an existing event (on EditEventPage), a new event (on AddEventPage), or to their own profile (on UserSettings). These conditions are handled respectively in function below. */
  const getAddableInterests = (): string[] => {
    const allUserInterests: string[] = otherVisibleUsers
      ? Methods.removeDuplicatesFromArray(
          otherVisibleUsers.map((user) => user.interests).flat()
        )
      : [];
    const allEventInterests: string[] = allEvents
      ? Methods.removeDuplicatesFromArray(
          allEvents.map((event) => event.relatedInterests).flat()
        )
      : [];

    if (interestsRelation === "event" && currentEvent) {
      // In the case of editing an already-existing event:
      // Returns allOtherEventInterests + allUserInterests - interests that exist on currentEvent
      const allOtherEventInterests: string[] = allEvents
        ? Methods.removeDuplicatesFromArray(
            allEvents
              .filter((ev) => ev._id !== currentEvent?._id)
              .map((ev) => ev.relatedInterests)
              .flat()
              .filter((int) => !currentEvent.relatedInterests.includes(int))
          )
        : [];
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
    const allOtherUserInterests: string[] = otherVisibleUsers
      ? Methods.removeDuplicatesFromArray(
          otherVisibleUsers
            .filter((user) => user.username !== currentUser?.username)
            .map((user) => user.interests)
            .flat()
        )
      : [];
    return Methods.removeDuplicatesFromArray(
      allOtherUserInterests
        .concat(allEventInterests)
        .filter((int) => !currentUser?.interests.includes(int))
    );
  };
  const addableInterests: string[] | null = fetchAllVisibleOtherUsersQuery.isSuccess
    ? getAddableInterests()
    : null;

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
    const addableInterests = getAddableInterests(); // get updated addableInterests
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
    if (addableInterests !== null) {
      setDisplayedAdditionalInterests(addableInterests);
    }
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
    if (addableInterests !== null) {
      setDisplayedAdditionalInterests(addableInterests);
    }
  }, []);

  useEffect(() => {
    /* Ensure that, whenever current-user/event interests or newEventInterests change, & inputInterest if empty string (which is always the case, whether b/c InterestModal isn't rendered, user hasn't input anything, or it was cleared after user input something & then added an interest), displayedAdditionalInterests is updated. */
    if (inputInterest === "" && addableInterests !== null) {
      setDisplayedAdditionalInterests(addableInterests);
    }
  }, [currentUser?.interests, currentEvent?.relatedInterests, newEventInterests]);

  return (
    <div style={{ margin: "1rem 0 1rem 0" }} className={styles.interestsSection}>
      <header className="input-label">
        {interestsRelation === "user" ? "Interests: " : "Related Interests: "}
        {!isDisabled && (
          <span
            tabIndex={0}
            aria-hidden="false"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowInterestsModal(!showInterestsModal);
              }
            }}
            style={{ "color": randomColor }}
            className={styles.showModule}
            onClick={() => setShowInterestsModal(!showInterestsModal)}
          >
            Browse
          </span>
        )}
      </header>
      <div className={styles.interestsContainer}>
        {savedInterests?.length ? (
          Methods.getStringArraySortedAlphabetically(savedInterests)?.map((interest) => (
            <Tab
              key={interest}
              info={interest}
              removeHandler={handleRemoveInterest}
              removeHandlerNeedsEventParam={true}
              removeHandlerParams={[interest]}
              isDisabled={isDisabled}
              randomColor={randomColor}
            />
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
          handleInterestsInput={handleInterestsInput}
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
