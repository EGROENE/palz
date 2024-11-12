import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

const UserCard = ({ user }: { user: TUser }) => {
  const { currentUser, allUsers } = useMainContext();
  // Will update on time, unlike currentUser, when allUsers is changed (like when user sends/retracts friend request)
  const currentUserUpdated = allUsers.filter((user) => user._id === currentUser?._id)[0];

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [buttonsAreDisabled, setButtonsAreDisabled] = useState<boolean>(false);
  const [friendRequestSent, setFriendRequestSent] = useState<boolean>(false);

  /* sender below is absolute most-current version of currentUser. currentUser itself (the state value) doesn't update in time if friend requests are sent/rescinded, but the corresponding user in allUsers does update in time, so sender is simply that value, captured when Add/Retract friend req btn is clicked. */
  //const sender = allUsers.filter((user) => user._id === currentUser?._id)[0];

  useEffect(() => {
    // Set color of event card's border randomly:
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);

    // Initialize value of friendRequestSent:
    if (
      user._id &&
      currentUserUpdated?._id &&
      currentUserUpdated?.friendRequestsSent.includes(user._id) &&
      user.friendRequestsReceived.includes(currentUserUpdated?._id)
    ) {
      setFriendRequestSent(true);
    }
  }, []);

  const matchingCountryObject:
    | {
        country: string;
        abbreviation: string;
        phoneCode: string;
      }
    | undefined = countries.filter((country) => country.country === user.country)[0];

  const userCountryAbbreviation: string | undefined =
    user.country !== "" && matchingCountryObject
      ? matchingCountryObject.abbreviation
      : undefined;

  const handleSendFriendRequest = (sender: TUser | undefined, recipient: TUser): void => {
    setFriendRequestSent(true);
    setButtonsAreDisabled(true);

    let isRequestError = false;

    const promisesToAwait =
      sender && sender._id && recipient._id
        ? [
            Requests.addToFriendRequestsReceived(sender?._id, recipient),
            Requests.addToFriendRequestsSent(sender, recipient._id),
          ]
        : undefined;

    if (promisesToAwait) {
      Promise.all(promisesToAwait)
        .then(() => {
          for (const promise of promisesToAwait) {
            promise.then((response) => {
              if (!response.ok) {
                isRequestError = true;
              }
            });
          }
        })
        .then(() => {
          if (isRequestError) {
            setFriendRequestSent(false);
            toast.error("Couldn't send request. Please try again.");
          } else {
            toast.success("Friend request sent!");
            //fetchAllUsers();
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setButtonsAreDisabled(false));
    }
  };

  const handleRetractFriendRequest = (
    sender: TUser | undefined,
    recipient: TUser
  ): void => {
    setButtonsAreDisabled(true);
    setFriendRequestSent(false);
    if (sender && sender._id) {
      Requests.removeFromFriendRequestsReceived(sender?._id, recipient)
        .then((response) => {
          if (!response.ok) {
            setFriendRequestSent(true);
            toast.error("Could not retract request. Please try again.");
          } else {
            if (sender && recipient._id) {
              Requests.removeFromFriendRequestsSent(sender, recipient._id)
                .then((response) => {
                  if (!response.ok) {
                    setFriendRequestSent(true);
                    toast.error("Could not retract request. Please try again.");
                  } else {
                    toast.error("Friend request retracted");
                  }
                })
                .catch((error) => console.log(error));
            }
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setButtonsAreDisabled(false));
    }
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
        src={
          user.profileImage !== "" && typeof user.profileImage === "string"
            ? user.profileImage
            : defaultProfileImage
        }
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
            friendRequestSent
              ? handleRetractFriendRequest(currentUser, user)
              : handleSendFriendRequest(currentUser, user);
          }}
          disabled={buttonsAreDisabled}
          style={{ backgroundColor: randomColor }}
        >
          {friendRequestSent ? (
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
