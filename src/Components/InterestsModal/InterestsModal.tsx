/* Returns a modal wherein user can see a bunch of tabs, each of which represent an interest & a '+', which adds interest to certain array. There is also a search bar that can be used to find interests or type in a nonexistent interest to be added. */
const InterestsModal = ({
  addableInterests,
  handleClearAddInterestInput,
  setShowInterestsModal,
  inputInterest,
  setInputInterest,
  inputInterestsHandler,
  handleAddInterest,
  noAdditionalInterestsAndInputInterest,
  noAdditionalInterestsAndNoInputInterest,
  disableAddInterestsButton,
  randomColor,
  interestsRelation,
}: {
  addableInterests: string[];
  handleClearAddInterestInput: () => void;
  setShowInterestsModal: (value: React.SetStateAction<boolean>) => void;
  inputInterest: string;
  setInputInterest: React.Dispatch<React.SetStateAction<string>>;
  inputInterestsHandler: (input: string) => void;
  handleAddInterest: (
    interest: string,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  noAdditionalInterestsAndInputInterest: boolean;
  noAdditionalInterestsAndNoInputInterest: boolean;
  disableAddInterestsButton: boolean;
  randomColor?: string;
  interestsRelation: "event" | "user";
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
                onClick={() => handleClearAddInterestInput()}
                className="fas fa-times"
              ></i>
            )}
            <button
              onClick={(e) => {
                handleAddInterest(inputInterest, e);
                handleClearAddInterestInput();
              }}
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
            addableInterests.map((interest) => (
              <span
                className="tab"
                key={interest}
                style={{ backgroundColor: randomColor }}
              >
                {interest}
                <i
                  onClick={(e) => handleAddInterest(interest, e)}
                  style={{ "rotate": "45deg" }}
                  title="Add"
                  className="fas fa-times"
                ></i>
              </span>
            ))}
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
