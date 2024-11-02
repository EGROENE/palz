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
  return (
    <label>
      <label
        className={styles.uploadFileButton}
        htmlFor="profile-image-upload"
        style={{ backgroundColor: randomColor }}
      >
        {addFileButtonText}
      </label>
      <input
        id="profile-image-upload"
        name="profileImage"
        onChange={(e) => addFile(e)}
        style={{ display: "none" }}
        type="file"
        accept=".jpeg, .png, .jpg"
      />
    </label>
  );
};
export default FileUploadWithButton;
