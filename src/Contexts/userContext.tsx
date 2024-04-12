import { createContext, ReactNode, useState } from "react";
import { TUserContext } from "../types";

export const UserContext = createContext<TUserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const userContextValues: TUserContext = {
    showSidebar,
    setShowSidebar,
  };

  return (
    <UserContext.Provider value={userContextValues}>{children}</UserContext.Provider>
  );
};
