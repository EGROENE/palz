import PongLoader from "../PongLoader/PongLoader";

const AccountDeletionInProgressModal = () => {
  return (
    <div className="modal-background">
      <div className="account-deletion-in-progress-modal">
        <header className="animate__animated animate__pulse animate animate__infinite">
          Deleting account...
        </header>
        <PongLoader />
      </div>
    </div>
  );
};
export default AccountDeletionInProgressModal;
