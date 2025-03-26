import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import SiteLinks from "../SiteLinks/SiteLinks";
import { TThemeColor } from "../../../types";

const Footer = () => {
  const [footerBorderColor, setFooterBorderColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    // Set color of event card's border randomly:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setFooterBorderColor(themeColors[randomNumber]);
  }, []);

  const now: Date = new Date();
  return (
    <div className={styles.footer}>
      {<hr style={{ border: `1px solid ${footerBorderColor}`, width: "75%" }} />}
      <SiteLinks />
      <footer>&copy; {`Palz ${now.getFullYear()}`}</footer>
    </div>
  );
};

export default Footer;
