import { createContext, ReactNode, useState } from "react";
import { TUserContext } from "../types";
import { useMainContext } from "../Hooks/useMainContext";
import { useLoginContext } from "../Hooks/useLoginContext";

export const UserContext = createContext<TUserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { removeCurrentUser, setUserCreatedAccount } = useMainContext();
  const { resetFormFieldsAndErrors } = useLoginContext();

  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const logout = (): void => {
    setUserCreatedAccount(null);
    removeCurrentUser();
    resetFormFieldsAndErrors();
  };

  const userContextValues: TUserContext = {
    showSidebar,
    setShowSidebar,
    logout,
  };

  return (
    <UserContext.Provider value={userContextValues}>{children}</UserContext.Provider>
  );
};
