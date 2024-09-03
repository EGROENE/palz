import styles from "../styles.module.css";

const ClosedEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <i
      onClick={() => toggleHidePassword()}
      className={`${styles.eye} far fa-eye`}
      title="Show Password"
    ></i>
  );
};
export default ClosedEye;
