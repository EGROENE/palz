import PongLoader from "../PongLoader/PongLoader";
import styles from "./styles.module.css";

const AccountDeletionInProgressModal = () => {
  return (
    <div className={styles.modalBackground}>
      <div className={styles.accountDeletionInProgressModal}>
        <header className="animate__animated animate__pulse animate animate__infinite">
          Deleting account...
        </header>
        <PongLoader />
      </div>
    </div>
  );
};
export default AccountDeletionInProgressModal;
