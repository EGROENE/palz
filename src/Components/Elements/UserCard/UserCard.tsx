import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";

const UserCard = ({ user }: { user: TUser }) => {
  const { currentUser, allUsers } = useMainContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [buttonsAreDisabled, setButtonsAreDisabled] = useState<boolean>(false);

  // Set color of event card's border randomly:
  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  const userCountryAbbreviation: string | undefined =
    user.country !== ""
      ? countries.filter((country) => country.country === user.country)[0].abbreviation
      : undefined;

  const handleSendFriendRequest = (sender: TUser, recipient: TUser): void => {
    setButtonsAreDisabled(true);

    let requestToUpdateSenderAndReceiverFriendRequestArraysIsOK: boolean = true;

    const addToFriendRequestsReceived = Requests.addToFriendRequestsReceived(
      sender._id,
      recipient
    )
      .then((response) => {
        if (!response.ok) {
          requestToUpdateSenderAndReceiverFriendRequestArraysIsOK = false;
        }
      })
      .catch((error) => console.log(error));

    const addToFriendRequestsSent = Requests.addToFriendRequestsSent(
      sender,
      recipient._id
    )
      .then((response) => {
        if (!response.ok) {
          requestToUpdateSenderAndReceiverFriendRequestArraysIsOK = false;
        }
      })
      .catch((error) => console.log(error));

    const promisesToAwait: Promise<void>[] = [
      addToFriendRequestsReceived,
      addToFriendRequestsSent,
    ];

    Promise.all(promisesToAwait)
      .then(() => {
        if (!requestToUpdateSenderAndReceiverFriendRequestArraysIsOK) {
          toast.error("Could not send friend request. Please try again.");
        } else {
          toast.success("Friend request sent!");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setButtonsAreDisabled(false);
      });
  };

  const handleRetractFriendRequest = (sender: TUser, recipient: TUser): void => {
    setButtonsAreDisabled(true);
    let requestToUpdateSenderAndReceiverFriendRequestArraysIsOK: boolean = true;

    const removeFromFriendRequestsReceived = Requests.removeFromFriendRequestsReceived(
      sender._id,
      recipient
    )
      .then((response) => {
        if (!response.ok) {
          requestToUpdateSenderAndReceiverFriendRequestArraysIsOK = false;
        }
      })
      .catch((error) => console.log(error));

    const removeFromFriendRequestsSent = Requests.removeFromFriendRequestsSent(
      recipient._id,
      sender
    )
      .then((response) => {
        if (!response.ok) {
          requestToUpdateSenderAndReceiverFriendRequestArraysIsOK = false;
        }
      })
      .catch((error) => console.log(error));

    const promisesToAwait = [
      removeFromFriendRequestsReceived,
      removeFromFriendRequestsSent,
    ];

    Promise.all(promisesToAwait)
      .then(() => {
        if (!requestToUpdateSenderAndReceiverFriendRequestArraysIsOK) {
          toast.error("Could not send friend request. Please try again.");
        } else {
          toast.error("Friend request retracted");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setButtonsAreDisabled(false);
      });
  };

  return (
    <div
      className={styles.userCard}
      style={{
        boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
      }}
    >
      <i
        style={{
          position: "absolute",
          right: "1rem",
          top: "1rem",
          fontSize: "1.25rem",
        }}
        className="fas fa-comments"
      ></i>
      <img
        style={{ border: `2px solid ${randomColor}` }}
        src={user.profileImage}
        alt="profile image"
      />
      <header>
        {user.firstName} {user.lastName}
      </header>
      <p>{user.username}</p>
      {user.country !== "" && (
        <div className={styles.userCardLocationContainer}>
          <p>{`${user.city}, ${user.stateProvince}`}</p>
          <img src={`/flags/4x3/${userCountryAbbreviation}.svg`} />
        </div>
      )}
      <div className={styles.userCardBtnContainer}>
        <button
          onClick={() => {
            /* sender below is absolute most-current version of currentUser. currentUser itself (the state value) doesn't update in time if friend requests are sent/rescinded, but the corresponding user in allUsers does update in time, so sender is simply that value, captured when Add/Retract friend req btn is clicked. */
            const sender = allUsers.filter((user) => user._id === currentUser?._id)[0];
            currentUser?._id &&
              user._id &&
              (user.friendRequestsReceived.includes(currentUser._id) &&
              sender.friendRequestsSent.includes(user._id)
                ? handleRetractFriendRequest(sender, user)
                : handleSendFriendRequest(sender, user));
          }}
          disabled={buttonsAreDisabled}
          style={{ backgroundColor: randomColor }}
        >
          {currentUser?._id && user.friendRequestsReceived.includes(currentUser._id) ? (
            <>
              <i className="fas fa-user-minus"></i>Retract Request
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>Add Friend
            </>
          )}
        </button>
        <button disabled={buttonsAreDisabled}>View Profile</button>
      </div>
    </div>
  );
};
export default UserCard;
