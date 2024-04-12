import { useContext } from "react";
import { UserContext } from "../Contexts/userContext";

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used inside UserContext provider");
  }
  return context;
};
