import styles from "./styles.module.css";
import SiteLinks from "../SiteLinks/SiteLinks";

const Footer = () => {
  const now: Date = new Date();
  return (
    <div className={styles.footer}>
      <SiteLinks />
      <footer>&copy; {`Palz ${now.getFullYear()}`}</footer>
    </div>
  );
};

export default Footer;
