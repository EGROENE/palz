import styles from "../styles.module.css";

const OpenEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <button
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          toggleHidePassword();
        }
      }}
      onClick={() => toggleHidePassword()}
      className={`${styles.eye} fas fa-eye-slash`}
      title="Hide Password"
    ></button>
  );
};
export default OpenEye;
