import { useRef } from "react";
import styles from "./styles.module.css";

const FileUploadWithButton = ({
  addFile,
  addFileButtonText,
  randomColor,
}: {
  addFile: Function;
  addFileButtonText: string;
  randomColor?: string;
}) => {
  const fileUploadInput = useRef<HTMLInputElement | null>(null);

  return (
    <label
      onKeyDown={() => {
        if (fileUploadInput.current) {
          fileUploadInput.current.click();
        }
      }}
      tabIndex={0}
    >
      <label
        className={styles.uploadFileButton}
        htmlFor="image-upload"
        style={
          randomColor === "var(--primary-color)"
            ? { backgroundColor: randomColor, color: "black" }
            : { backgroundColor: randomColor, color: "white" }
        }
      >
        {addFileButtonText}
      </label>
      <input
        ref={fileUploadInput}
        id="image-upload"
        name="profileImage"
        onChange={(e) => {
          addFile(e);
        }}
        style={{ display: "none" }}
        type="file"
        accept=".jpeg, .png, .jpg"
      />
    </label>
  );
};
export default FileUploadWithButton;
