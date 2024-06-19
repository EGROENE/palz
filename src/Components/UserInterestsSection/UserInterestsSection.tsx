import { useState, useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import Requests from "../../requests";
import Methods from "../../methods";
import toast from "react-hot-toast";
import InterestsModal from "../InterestsModal/InterestsModal";

const UserInterestsSection = ({ randomColor }: { randomColor: string }) => {
  const [showInterestsModal, setShowInterestsModal] = useState<boolean>(false);

  const [inputInterest, setInputInterest] = useState<string>("");

  const [displayedAdditionalInterests, setDisplayedAdditionalInterests] = useState<
    string[]
  >([]);

  const noAdditionalInterestsAndInputInterest =
    displayedAdditionalInterests.length === 0 && inputInterest !== "";
  const noAdditionalInterestsAndNoInputInterest =
    displayedAdditionalInterests.length === 0 && inputInterest === "";
  const disableAddInterestsButton =
    displayedAdditionalInterests.length === 1 &&
    inputInterest === displayedAdditionalInterests[0];

  const { currentUser, fetchAllUsers, allUsers } = useMainContext();

  const allOtherUserInterests = allUsers
    .filter((user) => user.username !== currentUser?.username)
    .map((user) => user.interests)
    .flat();
  const allInterestsNotOnCurrentUser: string[] = Methods.removeDuplicates(
    allOtherUserInterests.filter((int) => !currentUser?.interests.includes(int))
  );

  // HANDLERS
  const handleInterestsInput = (input: string): void => {
    const inputCaseInsensitive = input
      .replace(/[^a-z0-9ÄäÖöÜüÑñÉéóÓÍí -]/gi, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    setInputInterest(inputCaseInsensitive);
    if (inputCaseInsensitive.trim() === "") {
      setDisplayedAdditionalInterests(allInterestsNotOnCurrentUser);
    } else {
      for (const interest of allInterestsNotOnCurrentUser) {
        if (interest === inputCaseInsensitive.trim()) {
          setDisplayedAdditionalInterests(
            allInterestsNotOnCurrentUser.filter(
              (int) => int === inputCaseInsensitive.trim()
            )
          );
        } else {
          setDisplayedAdditionalInterests(
            allInterestsNotOnCurrentUser.filter((int) =>
              int.includes(inputCaseInsensitive.trim())
            )
          );
        }
      }
    }
  };

  const handleAddUserInterest = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    interest: string
  ): void => {
    e.preventDefault();
    Requests.addUserInterest(currentUser, interest.trim())
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not add interest. Please try again.");
          fetchAllUsers();
        } else {
          toast.success(`'${interest}' added to interests`);
          fetchAllUsers();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleDeleteUserInterest = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    interest: string
  ): void => {
    e.preventDefault();
    Requests.deleteUserInterest(currentUser, interest)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete interest. Please try again.");
          fetchAllUsers();
        } else {
          toast.success(`'${interest}' removed from interests`);
          fetchAllUsers();
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    setDisplayedAdditionalInterests(allInterestsNotOnCurrentUser);
  }, []);

  useEffect(() => {
    /* Somehow, if user inputs an interest, currentUser?.interests changes, so only set displayedAdditionalInterests to allInterestsNotOnCurrentUser if inputInterest === "". This ensures displayedAdditionalInterests updates as soon as user adds/deletes interest */
    if (inputInterest === "") {
      setDisplayedAdditionalInterests(allInterestsNotOnCurrentUser);
    }
  }, [currentUser?.interests]);

  return (
    <div className="interests-section">
      <p>
        Interests:{" "}
        <span
          style={{ "color": randomColor }}
          className="show-module"
          onClick={() => setShowInterestsModal(!showInterestsModal)}
        >
          Browse
        </span>
      </p>
      <div className="interests-container">
        {currentUser?.interests.length ? (
          currentUser?.interests.map((interest) => (
            <span className="tab" key={interest} style={{ backgroundColor: randomColor }}>
              {interest}

              <i
                title="Remove"
                onClick={(e) => handleDeleteUserInterest(e, interest)}
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
          displayedInterests={displayedAdditionalInterests}
          setShowInterestsModal={setShowInterestsModal}
          inputInterest={inputInterest}
          setInputInterest={setInputInterest}
          inputInterestsHandler={handleInterestsInput}
          addInterestHandler={handleAddUserInterest}
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
