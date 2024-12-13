import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser, TEvent } from "../../../types";
import styles from "./styles.module.css";

const DropdownChecklist = ({
  displayedItemsArray,
  storageArray,
  setStorageArray,
  displayCount,
  event,
}: {
  displayedItemsArray: TUser[]; // type can be changed later if used for non-user lists
  storageArray: string[];
  setStorageArray: React.Dispatch<React.SetStateAction<string[]>>;
  displayCount?: number;
  event?: TEvent;
}) => {
  const { isLoading } = useMainContext();
  const { handleAddRemoveUserAsOrganizer } = useUserContext();

  return (
    <ul className="dropdown-list">
      {displayedItemsArray.map((user) => (
        <div
          key={user._id}
          onClick={(e) =>
            handleAddRemoveUserAsOrganizer(e, storageArray, setStorageArray, user, event)
          }
          className={styles.otherUserOption}
        >
          <input
            name={`listed-user-${user._id}`}
            id={`listed-user-${user._id}`}
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
          <li title={`${user.firstName} ${user.lastName}`}>
            <img src={`${user.profileImage}`} />
            <span style={{ fontSize: "1rem" }}>{`${user.username}`}</span>
          </li>
        </div>
      ))}
    </ul>
  );
};
export default DropdownChecklist;
