import React from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { TUser, TEvent } from "../../../types";
import styles from "./styles.module.css";

const DropdownChecklist = ({
  usedFor,
  action,
  actionParams,
  actionEventParamNeeded,
  displayedItemsArray,
  storageArray,
  setStorageArray,
  displayedItemsCount,
  setDisplayedItemsCount,
  displayedItemsCountInterval,
  event,
}: {
  usedFor: string;
  action: Function;
  actionParams?: any[];
  actionEventParamNeeded: boolean;
  displayedItemsArray: TUser[]; // type can be changed later if used for non-user lists
  storageArray: any[];
  setStorageArray: React.Dispatch<React.SetStateAction<any[]>>;
  displayedItemsCount: number | null;
  setDisplayedItemsCount: React.Dispatch<React.SetStateAction<number | null>>;
  displayedItemsCountInterval?: number;
  event?: TEvent;
}) => {
  const { isLoading, handleLoadMoreOnScroll } = useMainContext();

  const { handleAddRemoveUserAsOrganizer, organizers, setOrganizers } = useEventContext();

  let displayedItemsArrayFiltered: TUser[] = [];
  if (displayedItemsCount && displayedItemsCount <= displayedItemsArray.length) {
    for (let i = 0; i < displayedItemsCount; i++) {
      displayedItemsArrayFiltered.push(displayedItemsArray[i]);
    }
  } else {
    displayedItemsArrayFiltered = displayedItemsArray;
  }

  const getActionParams = (user: TUser): any[] => {
    if (!actionParams) {
      // for handleAddRemoveUserAsOrganizer:
      if (usedFor === "potential-co-organizers" && user && event) {
        return [organizers, setOrganizers, user, event];
      }

      // for either handleAddRemoveUserAsInvitee, handleAddRemoveUserFromChat, or handleAddRemoveUserFromChat:
      if (
        usedFor === "potential-invitees" ||
        usedFor === "potential-invitees" ||
        usedFor === "potential-chat-members" ||
        usedFor === "potential-additional-chat-members"
      ) {
        return [user];
      }

      return [];
    }
    return actionParams;
  };

  return (
    <ul
      onScroll={(e) =>
        handleLoadMoreOnScroll(
          displayedItemsCount,
          setDisplayedItemsCount,
          displayedItemsArray,
          displayedItemsArrayFiltered,
          displayedItemsCountInterval,
          e
        )
      }
      className={styles.dropdownChecklist}
    >
      {displayedItemsArrayFiltered.map((user) => (
        <li
          key={user._id}
          onClick={
            actionEventParamNeeded
              ? (e) => action(e, ...getActionParams(user))
              : () => action(...getActionParams(user))
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
            checked={storageArray.includes(user._id)}
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
