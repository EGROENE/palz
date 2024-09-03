import styles from "./styles.module.css";

const PongLoader = () => {
  return (
    /* From Uiverse.io by TemRevil */
    <div className={styles.loading}>
      <div className={styles.loadingBox}>
        <div className={`${styles.WH} ${styles.color} ${styles.l1}`}></div>
        <div className={`${styles.ball} ${styles.color}`}></div>
        <div className={`${styles.WH} ${styles.color} ${styles.l2}`}></div>
      </div>
    </div>
  );
};
export default PongLoader;
