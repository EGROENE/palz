import { useEffect, useState } from "react";
import Methods from "../../../methods";
import { TThemeColor } from "../../../types";
import SearchBar from "../SearchBar/SearchBar";
import Tab from "../Tab/Tab";
import styles from "./styles.module.css";
import Requests from "../../../requests";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";

/* Returns a modal wherein user can see a bunch of tabs, each of which represent an interest & a '+', which adds interest to certain array. There is also a search bar that can be used to find interests or type in a nonexistent interest to be added. */
const InterestsModal = ({
  setShowInterestsModal,
  interestsRelation,
  savedInterests,
  setSavedInterests,
  randomColor,
}: {
  setShowInterestsModal: (value: React.SetStateAction<boolean>) => void;
  interestsRelation: "event" | "user";
  savedInterests: string[];
  setSavedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  randomColor?: TThemeColor;
}) => {
  const { theme } = useMainContext();

  const { currentUser, setCurrentUser } = useUserContext();

  const { handleAddEventInterest, currentEvent } = useEventContext();

  const [originalAddableInterests, setOriginalAddableInterests] = useState<string[]>([]);

  const [displayedAddableInterests, setDisplayedAddableInterests] = useState<string[]>(
    []
  );

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);

  const [isFetchError, setIsFetchError] = useState<boolean>(false);

  const [inputInterest, setInputInterest] = useState<string>("");

  const noAdditionalInterestsAndInputInterest =
    displayedAddableInterests &&
    displayedAddableInterests.length === 0 &&
    inputInterest !== "";

  const noAdditionalInterestsAndNoInputInterest =
    displayedAddableInterests &&
    displayedAddableInterests.length === 0 &&
    inputInterest === "";

  const disableAddInterestsButton =
    (displayedAddableInterests &&
      displayedAddableInterests.length === 1 &&
      inputInterest === displayedAddableInterests[0]) ||
    inputInterest === "";

  useEffect(() => {
    // get all user interests, then event interests. handle potential request fails
    setFetchIsLoading(true);
    Requests.getAllUserInterests()
      .then((res) => {
        if (res.ok) {
          res.json().then((userInterests) => {
            Requests.getAllEventInterests()
              .then((res) => {
                if (res.ok) {
                  setFetchIsLoading(false);
                  res.json().then((eventInterests) => {
                    let combinedInterests: string[] = [];
                    userInterests.forEach((o: { interests: string[] }) => {
                      o.interests.forEach((i) => {
                        if (combinedInterests.indexOf(i) === -1) {
                          combinedInterests.push(i);
                        }
                      });
                    });
                    eventInterests.forEach((o: { relatedInterests: string[] }) => {
                      o.relatedInterests.forEach((i) => {
                        if (combinedInterests.indexOf(i) === -1) {
                          combinedInterests.push(i);
                        }
                      });
                    });

                    const addableInts = Methods.removeDuplicatesFromArray(
                      combinedInterests.filter((i) => savedInterests?.indexOf(i) === -1)
                    );
                    setOriginalAddableInterests(addableInts);
                    setDisplayedAddableInterests(addableInts);
                  });
                } else {
                  setFetchIsLoading(false);
                  setIsFetchError(true);
                }
              })
              .catch((error) => console.log(error));
          });
        } else {
          setFetchIsLoading(false);
          setIsFetchError(true);
        }
      })
      .catch((error) => console.log(error));
  }, [currentUser?.interests, currentEvent?.relatedInterests]);

  // HANDLERS
  const addInterest = (
    interest: string,
    type: "user" | "event",
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    //e.preventDefault();
    // Opt set displayedAddableInterests & saved interests (def in state of InterestsSection, pass value & setter here)
    setDisplayedAddableInterests(displayedAddableInterests.filter((i) => i !== interest));

    setSavedInterests(savedInterests.concat(interest));

    // Dep on param, call request to add interest to user/event:
    // maybe del handleAddUser/EventInterest handlers throughout app
    if (type === "user") {
      Requests.addUserInterest(currentUser, interest.trim()).then((res) => {
        if (res.ok) {
          if (currentUser && currentUser._id) {
            Requests.getUserByID(currentUser._id.toString())
              .then((res) => {
                if (res.ok) {
                  res
                    .json()
                    .then((user) => {
                      if (user) {
                        setCurrentUser(user);
                        toast.success(`'${interest}' added to interests`, {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid green",
                          },
                        });
                      } else {
                        toast.error("Could not add interest. Please try again.", {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        });
                      }
                    })
                    .catch((error) => console.log(error));
                } else {
                  setDisplayedAddableInterests(
                    displayedAddableInterests.concat(interest)
                  );

                  setSavedInterests(savedInterests.filter((i) => i !== interest));

                  toast.error("Could not add interest. Please try again.", {
                    style: {
                      background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                      color: theme === "dark" ? "black" : "white",
                      border: "2px solid red",
                    },
                  });
                }
              })
              .catch((error) => console.log(error));
          }
        } else {
          setDisplayedAddableInterests(displayedAddableInterests.concat(interest));

          setSavedInterests(savedInterests.filter((i) => i !== interest));

          toast.error("Could not add interest. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      });
    }

    if (type == "event") {
      handleAddEventInterest(interest, e);
    }
  };

  const handleInterestsInput = (input: string): void => {
    const inputCaseInsensitive = input
      .replace(/[^a-z0-9ÄäÖöÜüÑñÉéóÓÍí -]/gi, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    setInputInterest(inputCaseInsensitive);
    if (inputCaseInsensitive.trim() === "") {
      setDisplayedAddableInterests(originalAddableInterests);
    } else {
      for (const interest of originalAddableInterests) {
        if (interest === inputCaseInsensitive.trim()) {
          setDisplayedAddableInterests(
            originalAddableInterests.filter((int) => int === inputCaseInsensitive.trim())
          );
        } else {
          setDisplayedAddableInterests(
            originalAddableInterests.filter((int) =>
              int.includes(inputCaseInsensitive.trim())
            )
          );
        }
      }
    }
  };

  const handleClearAddInterestInput = (): void => {
    setInputInterest("");
    setDisplayedAddableInterests(originalAddableInterests);
  };

  return (
    <>
      {
        <div tabIndex={0} aria-hidden="false" className="modal-background">
          <i
            tabIndex={0}
            aria-hidden="false"
            title="Close"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowInterestsModal(false);
                handleInterestsInput("");
              }
            }}
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
                addMethod={addInterest}
                randomColor={randomColor}
                numberOfResults={displayedAddableInterests.length}
              />
            </div>
            {fetchIsLoading && (
              <header style={{ marginTop: "3rem" }} className="query-status-text">
                Loading...
              </header>
            )}
            {isFetchError && !fetchIsLoading && (
              <p>Error loading interests; please reload the page.</p>
            )}
            {!isFetchError && !fetchIsLoading && (
              <div className={styles.nonUserInterestsContainer}>
                {!noAdditionalInterestsAndNoInputInterest &&
                  !noAdditionalInterestsAndInputInterest &&
                  Methods.getStringArraySortedAlphabetically(
                    displayedAddableInterests
                  ).map((interest) => (
                    <Tab
                      info={interest}
                      key={interest}
                      addHandler={addInterest}
                      addHandlerNeedsEventParam={true}
                      addHandlerParams={[interest, interestsRelation]}
                      randomColor={randomColor}
                    />
                  ))}
                {noAdditionalInterestsAndNoInputInterest &&
                  interestsRelation === "user" && (
                    <p>Type in an interest of yours & add it!</p>
                  )}
                {noAdditionalInterestsAndNoInputInterest &&
                  interestsRelation === "event" && (
                    <p>Type in an interest relating to this event & add it!</p>
                  )}

                {noAdditionalInterestsAndInputInterest && (
                  <p>No matching interests exist, but you can add what you typed!</p>
                )}
              </div>
            )}
          </div>
        </div>
      }
    </>
  );
};
export default InterestsModal;
