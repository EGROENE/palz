import styles from "./styles.module.css";
import SiteLinks from "../SiteLinks/SiteLinks";
import { TThemeColor } from "../../../types";

const Footer = ({ randomColor }: { randomColor?: TThemeColor }) => {
  const now: Date = new Date();
  return (
    <div className={styles.footer}>
      {randomColor && <hr style={{ border: `1px solid ${randomColor}`, width: "75%" }} />}
      <SiteLinks />
      <footer>&copy; {`Palz ${now.getFullYear()}`}</footer>
    </div>
  );
};

export default Footer;
