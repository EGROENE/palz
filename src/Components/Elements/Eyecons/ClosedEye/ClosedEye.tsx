import styles from "../styles.module.css";

const ClosedEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <i
      tabIndex={0}
      aria-hidden="false"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          toggleHidePassword();
        }
      }}
      onClick={() => toggleHidePassword()}
      className={`${styles.eye} far fa-eye`}
      title="Show Password"
    ></i>
  );
};
export default ClosedEye;
