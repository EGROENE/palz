import { useUserContext } from "../../../Hooks/useUserContext";
import styles from "./styles.module.css";

const Welcome = () => {
  const { currentUser, userCreatedAccount } = useUserContext();

  return (
    <div className="page-hero">
      <div className={styles.welcomeBox}>
        <h1 className="animate__animated animate__pulse">
          {userCreatedAccount
            ? `Welcome to Palz, ${currentUser?.firstName}!`
            : `Welcome back, ${currentUser?.firstName}!`}
        </h1>
      </div>
    </div>
  );
};
export default Welcome;
