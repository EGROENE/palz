const ClosedEye = ({ toggleHidePassword }: { toggleHidePassword: () => void }) => {
  return (
    <i
      onClick={() => toggleHidePassword()}
      className="eye far fa-eye"
      title="Show Password"
    ></i>
  );
};
export default ClosedEye;
