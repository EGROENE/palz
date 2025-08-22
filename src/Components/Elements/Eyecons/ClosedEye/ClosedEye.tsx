import styles from "../styles.module.css";

const ClosedEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <button
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          toggleHidePassword();
        }
      }}
      onClick={() => toggleHidePassword()}
      className={`${styles.eye} far fa-eye`}
      title="Show Password"
    ></button>
  );
};
export default ClosedEye;
