import { TUser } from "../../../types";

const UserCard = ({ user }: { user: TUser }) => {
  return <h1>{user.username}</h1>;
};
export default UserCard;
