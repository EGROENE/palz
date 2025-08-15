import { useEffect } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";

const TermsAndConditions = () => {
  const { theme } = useMainContext();
  const { logout, currentUser, userCreatedAccount } = useUserContext();

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      logout();
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  }, [currentUser, navigation, userCreatedAccount]);

  return (
    <>
      {" "}
      <h1>Terms & Conditions</h1>
      <div className="terms-and-conditions-paragraphs-container">
        <p>
          PALZ ist kein berechtigtes Unternehmen, denn es ist kein Unternehmen, also diese
          Internetseite dient keinem Unternehmen. Ich erstellte sie mit der einzigen
          Absicht, meine Fähigkeiten bezüglich Webentwicklung zu verbessern und sie soll
          halt Teil meines Portefeuilles als Webentwickler sein, nichts mehr. Naja, genug
          mitm ganzen rechtlichen Scheiß: jetzt sind einige zufällige Ausschnitte von
          Goethes ,,Faust" zum Lesen da...
        </p>
        <p>
          So schreitet in dem engen Bretterhaus (Theater, Bühne) Den ganzen Kreis der
          Schöpfung aus, Und wandelt mit bedächtger Schnelle Vom Himmel durch die Welt zur
          Hölle!
        </p>
        <p>
          Wenn sich der Mensch, wenn er nur Worte hört, Es müsse sich dabei doch auch was
          denken lassen. Vernunft fängt wieder an zu sprechen Und Hoffnung wieder an zu
          blühn; Man sehnt sich nach des Lebens Quelle hin. Vernunft fängt wieder an zu
          sprechen Und Hoffnung wieder an zu sprechen Und Hoffnung wieder an zu sprechen
          Und Hoffnung wieder an zu blühn; Man sehnt sich nach des Lebens Quelle hin.
        </p>
        <p>
          Ich bin von je der Ordnung Freund gewesen. Ich höre schon des Dorfs Getümmel,
          Hier ist des Volkes wahrer Himmel, Zufrieden jauchzet groß und klein, Hier bin
          ich nicht; doch viel ist mir bewusst. Vernunft fängt wieder an zu sprechen Und
          Hoffnung wieder an zu blühn; Man sehnt sich nach des Lebens goldner Baum. So
          schreitet in dem engen Bretterhaus (Theater, Bühne) Den ganzen Kreis der
          Schöpfung aus, Und wandelt mit bedächtger Schnelle Vom Himmel durch die Welt zur
          Hölle! Ich bin Ein Teil von jener Kraft, Die stets das Gute schafft. Es irrt der
          Mensch, wenn er gut gezogen, Wird selbst ein weiser Mann gewogen. Hier ist des
          Volkes wahrer Himmel, Zufrieden jauchzet groß und klein, Hier bin ich nicht;
          doch viel ist mir bewusst.
        </p>
        <p>
          So schreitet in dem engen Bretterhaus (Theater, Bühne) Den ganzen Kreis der
          Schöpfung aus, Und wandelt mit bedächtger Schnelle Vom Himmel durch die Welt zur
          Hölle!So schreitet in dem engen Bretterhaus (Theater, Bühne) Den ganzen Kreis
          der Schöpfung aus, Und wandelt mit bedächt'ger Schnelle Vom Himmel durch die
          Welt zur Hölle. Vernunft fängt wieder an zu sprechen Und Hoffnung wieder an zu
          sprechen Und Hoffnung wieder an zu sprechen Und Hoffnung wieder an zu sprechen
          Und Hoffnung wieder an zu sprechen Und Hoffnung wieder an zu blühn; Man sehnt
          sich nach des Lebens goldner Baum. Es irrt der Mensch, wenn er sie beim Kragen
          hätte.
        </p>
        <p>
          So schreitet in dem engen Bretterhaus (Theater, Bühne) Den ganzen Kreis der
          Schöpfung aus, Und wandelt mit bedächtger Schnelle Vom Himmel durch die Welt zur
          Hölle! Gewöhnlich glaubt der Mensch, wenn er sie beim Kragen hätte.
        </p>
      </div>
    </>
  );
};

export default TermsAndConditions;
