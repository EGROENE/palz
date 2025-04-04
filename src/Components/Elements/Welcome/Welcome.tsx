import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";

const Welcome = () => {
  const { userCreatedAccount, firstName } = useUserContext();

  return (
    <div className={styles.welcomeBox}>
      <header className="animate__animated animate__pulse">
        {userCreatedAccount
          ? `Welcome to Palz, ${firstName}!`
          : `Welcome back, ${firstName}!`}
      </header>
    </div>
  );
};
export default Welcome;
