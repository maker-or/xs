'use client'; 

import React, { createContext, useContext, useState } from "react";

interface FolderContextType {
  folderName: string;
  setFolderName: (name: string) => void;
}



const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folderName, setFolderName] = useState("Folder");

  return (
    <FolderContext.Provider value={{ folderName, setFolderName }}>
      {children}
    </FolderContext.Provider>
  );
};

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
};
