import styles from "../styles.module.css";

const OpenEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <i
      onClick={() => toggleHidePassword()}
      className={`${styles.eye} fas fa-eye-slash`}
      title="Hide Password"
    ></i>
  );
};
export default OpenEye;
