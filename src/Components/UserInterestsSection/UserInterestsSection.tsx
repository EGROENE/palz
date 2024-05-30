import { useState, useEffect } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import Requests from "../../requests";
import Methods from "../../methods";
import toast from "react-hot-toast";

const UserInterestsSection = ({ randomColor }: { randomColor: string }) => {
  const [
    showExistingInterestsNotOnCurrentUser,
    setShowExistingInterestsNotOnCurrentUser,
  ] = useState<boolean>(false);

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
    const inputNoWhitespacesCaseInsensitive = input.replace(/\s+/g, " ").toLowerCase();
    setInputInterest(inputNoWhitespacesCaseInsensitive);
    if (inputNoWhitespacesCaseInsensitive.trim() === "") {
      setDisplayedAdditionalInterests(allInterestsNotOnCurrentUser);
    } else {
      for (const interest of allInterestsNotOnCurrentUser) {
        if (interest === inputNoWhitespacesCaseInsensitive.trim()) {
          setDisplayedAdditionalInterests(
            allInterestsNotOnCurrentUser.filter(
              (int) => int === inputNoWhitespacesCaseInsensitive.trim()
            )
          );
        } else {
          setDisplayedAdditionalInterests(
            allInterestsNotOnCurrentUser.filter((int) =>
              int.includes(inputNoWhitespacesCaseInsensitive.trim())
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
          onClick={() =>
            setShowExistingInterestsNotOnCurrentUser(
              !showExistingInterestsNotOnCurrentUser
            )
          }
        >
          Browse
        </span>
      </p>
      <div className="interests-container">
        {currentUser?.interests.length ? (
          currentUser?.interests.map((interest) => (
            <span
              className="interest-tab"
              key={interest}
              style={{ backgroundColor: randomColor }}
            >
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
      {showExistingInterestsNotOnCurrentUser && (
        <div className="all-user-interests-module-background">
          <i
            title="Close"
            onClick={() => {
              setShowExistingInterestsNotOnCurrentUser(false);
              setInputInterest("");
            }}
            className="fas fa-times close-interests-module-icon"
          ></i>
          <div className="all-user-interests-module">
            <div className="bar-and-description">
              <p>Don't see an interest listed? Type it below & add it:</p>
              <div className="add-interests-bar">
                <input
                  value={inputInterest}
                  onChange={(e) => handleInterestsInput(e.target.value.trim())}
                  type="text"
                  placeholder="Type an interest"
                ></input>
                {inputInterest !== "" && (
                  <i
                    title="Clear"
                    onClick={() => setInputInterest("")}
                    className="fas fa-times"
                  ></i>
                )}
                <button
                  onClick={(e) => handleAddUserInterest(e, inputInterest)}
                  disabled={disableAddInterestsButton}
                  style={{ backgroundColor: randomColor }}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="non-user-interests-container">
              {!noAdditionalInterestsAndNoInputInterest &&
                !noAdditionalInterestsAndInputInterest &&
                displayedAdditionalInterests.map((interest) => (
                  <span
                    className="interest-tab"
                    key={interest}
                    style={{ backgroundColor: randomColor }}
                  >
                    {interest}
                    <i
                      onClick={(e) => handleAddUserInterest(e, interest)}
                      style={{ "rotate": "45deg" }}
                      title="Add"
                      className="fas fa-times"
                    ></i>
                  </span>
                ))}
              {noAdditionalInterestsAndNoInputInterest && (
                <p>Type in an interest of yours & add it!</p>
              )}
              {noAdditionalInterestsAndInputInterest && (
                <p>No matching existing interests, but you can add what you typed!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserInterestsSection;
