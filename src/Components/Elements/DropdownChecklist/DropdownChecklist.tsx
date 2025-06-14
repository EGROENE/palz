import React from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { TBarebonesUser, TEvent, TOtherUser } from "../../../types";
import styles from "./styles.module.css";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import { useChatContext } from "../../../Hooks/useChatContext";

const DropdownChecklist = ({
  fetchIsLoading,
  scrollHandler,
  scrollHandlerParams,
  usedFor,
  action,
  actionParams,
  actionEventParamNeeded,
  displayedItemsArray,
  storageArray,
  setStorageArray,
  event,
}: {
  fetchIsLoading: boolean;
  scrollHandler: Function;
  scrollHandlerParams: any[];
  usedFor: string;
  action: Function;
  actionParams?: any[];
  actionEventParamNeeded: boolean;
  displayedItemsArray: TBarebonesUser[]; // type can be changed later if used for non-user lists
  storageArray: TBarebonesUser[] | TOtherUser[];
  setStorageArray: React.Dispatch<React.SetStateAction<any[]>>;
  event?: TEvent;
}) => {
  const { isLoading } = useMainContext();

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

  const getActionParams = (user: TBarebonesUser): any[] => {
    if (!actionParams) {
      // for handleAddRemoveUserAsOrganizer:
      if (usedFor === "potential-co-organizers") {
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

  const getOnChangeHandler = (user: TBarebonesUser) => {
    if (usedFor === "potential-co-organizers") {
      return handleAddRemoveUserAsOrganizer(storageArray, setStorageArray, user);
    }

    if (usedFor === "potential-invitees") {
      return handleAddRemoveUserAsInvitee(storageArray, setStorageArray, user);
    }

    if (usedFor === "potential-additional-chat-members" && currentChat) {
      return handleAddRemoveUserFromChat(
        user,
        storageArray,
        setStorageArray,
        currentChat
      );
    }

    if (usedFor === "potential-chat-members") {
      return handleAddRemoveUserFromChat(user, storageArray, setStorageArray);
    }

    if (usedFor === "potential-blockees") {
      return handleAddRemoveBlockedUserOnEvent(user);
    }
  };

  return (
    <ul
      onScroll={(e) => scrollHandler(...scrollHandlerParams, e)}
      className={styles.dropdownChecklist}
    >
      {displayedItemsArray.map((user) => (
        <li
          tabIndex={0}
          aria-hidden="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (actionEventParamNeeded) {
                action(...getActionParams(user), e);
              } else {
                action(...getActionParams(user));
              }
            }
          }}
          key={user._id?.toString()}
          onClick={
            actionEventParamNeeded
              ? (e) => action(...getActionParams(user), e)
              : () => action(...getActionParams(user))
          }
          className={styles.otherUserOption}
        >
          <input
            name={`${usedFor}-${user._id?.toString()}`}
            id={`${usedFor}-${user._id?.toString()}`}
            disabled={isLoading}
            onChange={() => getOnChangeHandler(user)}
            checked={storageArray.map((elem) => elem._id).includes(user._id)}
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
      {fetchIsLoading && <li className={styles.dropdownChecklistLoading}>Loading...</li>}
    </ul>
  );
};
export default DropdownChecklist;
