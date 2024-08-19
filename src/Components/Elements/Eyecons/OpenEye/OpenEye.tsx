const OpenEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <i
      onClick={() => toggleHidePassword()}
      className="eye fas fa-eye-slash"
      title="Hide Password"
    ></i>
  );
};
export default OpenEye;
