import { useContext } from "react";
import { LoginContext } from "../Contexts/loginContext";

export const useLoginContext = () => {
  const context = useContext(LoginContext);

  if (!context) {
    throw new Error("useLoginContext must be used inside LoginContext provider.");
  }

  return context;
};
