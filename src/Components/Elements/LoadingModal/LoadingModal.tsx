import PongLoader from "../PongLoader/PongLoader";
import styles from "./styles.module.css";

const LoadingModal = ({ message }: { message: string }) => {
  return (
    <div className="modal-background">
      <div className={styles.loadingModal}>
        <header className="animate__animated animate__pulse animate animate__infinite">
          {message}
        </header>
        <PongLoader />
      </div>
    </div>
  );
};
export default LoadingModal;
