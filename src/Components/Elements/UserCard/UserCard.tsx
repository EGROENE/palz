import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";

const UserCard = ({ user }: { user: TUser }) => {
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

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
        <button style={{ backgroundColor: randomColor }}>
          <i className="fas fa-user-plus"></i>Add Friend
        </button>
        <button>View Profile</button>
      </div>
    </div>
  );
};
export default UserCard;
