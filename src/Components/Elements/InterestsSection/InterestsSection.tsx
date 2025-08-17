import { useState, useEffect } from "react";
import { TThemeColor, TUser } from "../../../types";
import Methods from "../../../methods";
import InterestsModal from "../InterestsModal/InterestsModal";
import Tab from "../Tab/Tab";
import styles from "./styles.module.css";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";

type InterestsSectionProps = {
  randomColor: TThemeColor | undefined;
  interestsRelation: "event" | "user";
  handleRemoveInterest: (
    interest: string,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  isDisabled: boolean;
};

const InterestsSection = ({
  randomColor,
  interestsRelation,
  isDisabled,
}: InterestsSectionProps) => {
  const [showInterestsModal, setShowInterestsModal] = useState<boolean>(false);

  const {
    theme,
    savedInterests,
    setSavedInterests,
    setCurrentInterest,
    setShowInterestUsers,
    setInterestUsers,
    interestUsersFetchStart,
    interestUsersFetchLimit,
    setFetchInterestUsersIsError,
    setFetchInterestUsersIsLoading,
  } = useMainContext();

  const { currentUser, setCurrentUser } = useUserContext();

  const { currentEvent, handleRemoveEventInterest } = useEventContext();

  useEffect(() => {
    if (interestsRelation === "user" && currentUser) {
      setSavedInterests(currentUser.interests);
    } else if (currentEvent && interestsRelation === "event") {
      setSavedInterests(currentEvent.relatedInterests);
    }
  }, []);

  const deleteSavedInterest = (interest: string, type: "user" | "event"): void => {
    if (type === "user") {
      setSavedInterests(savedInterests.filter((i) => i !== interest));
      Requests.deleteUserInterest(currentUser, interest.trim()).then((res) => {
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
                        toast(`'${interest}' removed from interests`, {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        });
                      } else {
                        setSavedInterests(savedInterests.concat(interest));
                        toast.error("Could not delete interest. Please try again.", {
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
                  setSavedInterests(savedInterests.concat(interest));
                  toast.error("Could not delete interest. Please try again.", {
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
          setSavedInterests(savedInterests.concat(interest));
          toast.error("Could not delete interest. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      });
    }

    if (type === "event") {
      handleRemoveEventInterest(interest);
    }
  };

  return (
    <>
      {
        <div style={{ margin: "1rem 0 1rem 0" }} className={styles.interestsSection}>
          <header className="input-label">
            {interestsRelation === "user" ? "Interests: " : "Related Interests: "}
            {!isDisabled && (
              <span
                tabIndex={0}
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
          {savedInterests?.length > 0 && (
            <p>Click on an interest to see others who share that interest!</p>
          )}
          <div className={styles.interestsContainer}>
            {savedInterests?.length ? (
              Methods.getStringArraySortedAlphabetically(savedInterests)?.map(
                (interest) => (
                  <Tab
                    key={interest}
                    info={interest}
                    removeHandler={deleteSavedInterest}
                    removeHandlerNeedsEventParam={true}
                    removeHandlerParams={[interest, interestsRelation]}
                    isDisabled={isDisabled}
                    randomColor={randomColor}
                    onClick={() => {
                      if (currentUser?.username) {
                        setFetchInterestUsersIsLoading(true);
                        setShowInterestUsers(true);
                        Requests.getInterestUsers(
                          interest,
                          interestUsersFetchStart,
                          interestUsersFetchLimit,
                          currentUser.username
                        )
                          .then((res) => {
                            if (res.ok) {
                              res.json().then((interestUsers: TUser[]) => {
                                setCurrentInterest(interest);
                                setInterestUsers(
                                  interestUsers.map((u) => Methods.getTBarebonesUser(u))
                                );
                              });
                            } else {
                              setFetchInterestUsersIsError(true);
                            }
                          })
                          .catch((error) => console.log(error))
                          .finally(() => setFetchInterestUsersIsLoading(false));
                      } else {
                        setFetchInterestUsersIsError(true);
                      }
                    }}
                  />
                )
              )
            ) : (
              <p>Click 'browse' to add some interests!</p>
            )}
          </div>
          {showInterestsModal && (
            <InterestsModal
              setShowInterestsModal={setShowInterestsModal}
              randomColor={randomColor}
              interestsRelation={interestsRelation}
            />
          )}
        </div>
      }
    </>
  );
};
export default InterestsSection;
