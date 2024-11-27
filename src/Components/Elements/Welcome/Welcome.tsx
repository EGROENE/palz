import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";

const Welcome = () => {
  const { currentUser, userCreatedAccount } = useUserContext();

  return (
    <div className="page-hero">
      <div className={styles.welcomeBox}>
        <header className="animate__animated animate__pulse">
          {userCreatedAccount
            ? `Welcome to Palz, ${currentUser?.firstName}!`
            : `Welcome back, ${currentUser?.firstName}!`}
        </header>
      </div>
    </div>
  );
};
export default Welcome;
