import styles from "../styles.module.css";

const OpenEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
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
      className={`${styles.eye} fas fa-eye-slash`}
      title="Hide Password"
    ></i>
  );
};
export default OpenEye;
