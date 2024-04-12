import { useMainContext } from "../../Hooks/useMainContext";

const Sidebar = () => {
  const { currentUser } = useMainContext();

  return (
    <div className="sidebar">
      <img className="profile-image-sidebar" src={currentUser?.profileImage} />
      <div>
        <p>{`${currentUser?.firstName} ${currentUser?.lastName}`}</p>
        <p>{currentUser?.username}</p>
      </div>
    </div>
  );
};

export default Sidebar;
