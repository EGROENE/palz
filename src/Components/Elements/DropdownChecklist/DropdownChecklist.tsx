import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser, TEvent } from "../../../types";
import styles from "./styles.module.css";

const DropdownChecklist = ({
  usedFor,
  displayedItemsArray,
  storageArray,
  setStorageArray,
  displayCount,
  setDisplayCount,
  displayCountInterval,
  event,
}: {
  usedFor: string;
  displayedItemsArray: TUser[]; // type can be changed later if used for non-user lists
  storageArray: string[];
  setStorageArray: React.Dispatch<React.SetStateAction<string[]>>;
  displayCount?: number;
  setDisplayCount?: React.Dispatch<React.SetStateAction<number>>;
  displayCountInterval?: number;
  event?: TEvent;
}) => {
  const { isLoading } = useMainContext();

  const { handleAddRemoveUserAsOrganizer } = useUserContext();

  let displayedItemsArrayFiltered: TUser[] = [];
  if (displayCount) {
    for (let i = 0; i < displayCount; i++) {
      displayedItemsArrayFiltered.push(displayedItemsArray[i]);
    }
  } else {
    displayedItemsArrayFiltered = displayedItemsArray;
  }

  const handleScroll = (e: React.UIEvent<HTMLUListElement, UIEvent>): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement;
    const bottomReached = scrollTop + clientHeight === scrollHeight;
    if (displayCount && displayCountInterval && setDisplayCount) {
      if (bottomReached) {
        if (
          displayedItemsArray.length - displayedItemsArrayFiltered.length >=
          displayCountInterval
        ) {
          setDisplayCount(displayCount + displayCountInterval);
        } else {
          setDisplayCount(
            displayCount +
              (displayedItemsArray.length - displayedItemsArrayFiltered.length)
          );
        }
      }
    }
  };

  return (
    <ul onScroll={(e) => handleScroll(e)} className={styles.dropdownChecklist}>
      {displayedItemsArrayFiltered.map((user) => (
        <li
          key={user._id}
          onClick={(e) =>
            handleAddRemoveUserAsOrganizer(e, storageArray, setStorageArray, user, event)
          }
          className={styles.otherUserOption}
        >
          <input
            name={`${usedFor}-${user._id}`}
            id={`${usedFor}-${user._id}`}
            disabled={isLoading}
            onChange={(e) =>
              handleAddRemoveUserAsOrganizer(
                e,
                storageArray,
                setStorageArray,
                user,
                event
              )
            }
            checked={typeof user._id === "string" && storageArray.includes(user._id)}
            type="checkbox"
          />
          <div title={`${user.firstName} ${user.lastName}`}>
            <img src={`${user.profileImage}`} />
            <span style={{ fontSize: "1rem" }}>{`${user.username}`}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};
export default DropdownChecklist;
