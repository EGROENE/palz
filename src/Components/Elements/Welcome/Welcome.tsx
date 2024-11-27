import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";

const Welcome = () => {
  const { userCreatedAccount, firstName, lastName } = useUserContext();

  return (
    <div className="page-hero">
      <div className={styles.welcomeBox}>
        <header className="animate__animated animate__pulse">
          {userCreatedAccount
            ? `Welcome to Palz, ${firstName}!`
            : `Welcome back, ${lastName}!`}
        </header>
      </div>
    </div>
  );
};
export default Welcome;
