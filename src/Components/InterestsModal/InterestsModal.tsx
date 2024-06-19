/* Returns a modal wherein user can see a bunch of tabs, each of which represent an interest & a '+', which adds interest to certain array. There is also a search bar that can be used to find interests or type in a nonexistent interest to be added. */
const InterestsModal = ({
  displayedInterests,
  setShowInterestsModal,
  inputInterest,
  setInputInterest,
  inputInterestsHandler,
  addInterestHandler,
  noAdditionalInterestsAndInputInterest,
  noAdditionalInterestsAndNoInputInterest,
  disableAddInterestsButton,
  randomColor,
}: {
  displayedInterests: string[];
  setShowInterestsModal: (value: React.SetStateAction<boolean>) => void;
  inputInterest: string;
  setInputInterest: React.Dispatch<React.SetStateAction<string>>;
  inputInterestsHandler: (input: string) => void;
  addInterestHandler: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    interest: string
  ) => void;
  noAdditionalInterestsAndInputInterest: boolean;
  noAdditionalInterestsAndNoInputInterest: boolean;
  disableAddInterestsButton: boolean;
  randomColor?: string;
}) => {
  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={() => {
          setShowInterestsModal(false);
          setInputInterest("");
        }}
        className="fas fa-times close-module-icon"
      ></i>
      <div className="browse-interests-module">
        <div className="bar-and-description">
          <p>Don't see an interest listed? Type it below & add it:</p>
          <div className="add-interests-bar">
            <input
              value={inputInterest}
              onChange={(e) => inputInterestsHandler(e.target.value)}
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
              onClick={(e) => addInterestHandler(e, inputInterest)}
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
            displayedInterests.map((interest) => (
              <span
                className="tab"
                key={interest}
                style={{ backgroundColor: randomColor }}
              >
                {interest}
                <i
                  onClick={(e) => addInterestHandler(e, interest)}
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
  );
};
export default InterestsModal;
