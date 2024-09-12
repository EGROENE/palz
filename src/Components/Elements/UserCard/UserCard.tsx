import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";

const UserCard = ({ user }: { user: TUser }) => {
  const { fetchAllUsers, currentUser } = useMainContext();

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

  const handleSendFriendRequest = (senderID: string | number, recipient: TUser): void => {
    setButtonsAreDisabled(true);
    Requests.sendFriendRequest(senderID, recipient)
      .then((response) => {
        if (!response.ok) {
          fetchAllUsers();
          toast.error("Could not send friend request. Please try again.");
        } else {
          fetchAllUsers();
          toast.success("Friend request sent!");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setButtonsAreDisabled(false);
      });
  };

  const handleRetractFriendRequest = (
    senderID: string | number,
    recipient: TUser
  ): void => {
    setButtonsAreDisabled(true);
    Requests.retractFriendRequest(senderID, recipient)
      .then((response) => {
        if (!response.ok) {
          fetchAllUsers();
          toast.error("Could not send friend request. Please try again.");
        } else {
          fetchAllUsers();
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
          onClick={() =>
            currentUser?.id &&
            (user.friendRequests.includes(currentUser.id)
              ? handleRetractFriendRequest(currentUser.id, user)
              : handleSendFriendRequest(currentUser.id, user))
          }
          disabled={buttonsAreDisabled}
          style={{ backgroundColor: randomColor }}
        >
          {currentUser?.id && user.friendRequests.includes(currentUser.id) ? (
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
