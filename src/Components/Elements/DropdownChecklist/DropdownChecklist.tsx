import React from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { TUser, TEvent } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import { useChatContext } from "../../../Hooks/useChatContext";

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
  displayedItemsCount: number | undefined;
  setDisplayedItemsCount: React.Dispatch<React.SetStateAction<number | undefined>>;
  displayedItemsCountInterval?: number;
  event?: TEvent;
}) => {
  const { isLoading, handleLoadMoreOnScroll } = useMainContext();

  const {
    handleAddRemoveUserAsOrganizer,
    handleAddRemoveUserAsInvitee,
    organizers,
    setOrganizers,
    invitees,
    setInvitees,
    handleAddRemoveBlockedUserOnEvent,
  } = useEventContext();

  const {
    usersToAddToChat,
    setUsersToAddToChat,
    currentChat,
    handleAddRemoveUserFromChat,
  } = useChatContext();

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
        return [organizers, setOrganizers, user];
      }

      // for handleAddRemoveUserAsInvitee:
      if (usedFor === "potential-invitees") {
        return [invitees, setInvitees, user];
      }

      // for handleAddRemoveUserFromChat:
      if (usedFor === "potential-additional-chat-members") {
        return [user, usersToAddToChat, setUsersToAddToChat, currentChat];
      }

      // for handleAddRemoveUserFromChat:
      if (usedFor === "potential-chat-members") {
        return [user, usersToAddToChat, setUsersToAddToChat];
      }

      // for handleAddRemoveBlockedUserOnEvent:
      if (usedFor === "potential-blockees") {
        return [user];
      }
      return [];
    }
    return actionParams;
  };

  const getOnChangeHandler = (user: TUser) => {
    if (usedFor === "potential-co-organizers") {
      return () => handleAddRemoveUserAsOrganizer(storageArray, setStorageArray, user);
    }

    if (usedFor === "potential-invitees") {
      return () => handleAddRemoveUserAsInvitee(storageArray, setStorageArray, user);
    }

    if (usedFor === "potential-additional-chat-members" && currentChat) {
      return () =>
        handleAddRemoveUserFromChat(user, storageArray, setStorageArray, currentChat);
    }

    if (usedFor === "potential-chat-members") {
      return () => handleAddRemoveUserFromChat(user, storageArray, setStorageArray);
    }

    if (usedFor === "potential-blockees") {
      return () => handleAddRemoveBlockedUserOnEvent(user);
    }
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
            onChange={getOnChangeHandler(user)}
            checked={storageArray.includes(user._id)}
            type="checkbox"
          />
          <div title={`${user.firstName} ${user.lastName}`}>
            <img
              src={
                user.profileImage !== "" ? `${user.profileImage}` : defaultProfileImage
              }
            />
            <span style={{ fontSize: "1rem" }}>{`${user.username}`}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};
export default DropdownChecklist;
