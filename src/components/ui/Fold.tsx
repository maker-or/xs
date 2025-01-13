"use client";

import React, { useEffect, useState } from "react";
import Folder from "~/components/ui/Folder";
import { useFolder } from "~/components/ui/FolderContext";
import Group from "~/components/ui/Group";
import { v4 as uuidv4 } from 'uuid';

interface FolderType {
  folderId: number;
  id: string;
  userId: string;
  folderName: string;
}

const Fold = () => {
  const { folderName } = useFolder();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch folders on component mount
  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folder");
      if (!response.ok) throw new Error("Failed to fetch folders");
      const data = (await response.json()) as FolderType[];
      setFolders(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching folders:", error.message);
      } else {
        console.error("Unknown error occurred while fetching folders:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders().catch((err) =>
      console.error("Error initializing folder fetch:", err)
    );
  }, []);

  const generateId = () => {
    const id:string = uuidv4();
    const sanitizedId = id.replace(/-/g, ""); // Remove dashes from the UUID
    let hash = 0;

    for (let i = 0; i < sanitizedId.length; i++) {
      hash = (hash << 5) - hash + sanitizedId.charCodeAt(i);
      hash &= hash; // Convert to 32-bit integer
    }

    return Math.abs(hash);
  };

  // Function to add a new folder
  const addFolder = async () => {
    try {
      const newFolderId = generateId();
      const newFolderName = `${folderName} ${folders.length + 1}`;

      const response = await fetch("/api/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName: newFolderName,
          folderId: newFolderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");
      const newFolder = (await response.json()) as FolderType;

      setFolders((prevFolders) => [...prevFolders, newFolder]);
      window.location.reload()
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating folder:", error.message);
      } else {
        console.error("Unknown error occurred while creating folder:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="font-serif">Loading...</div>;
  }

  return (
    <div className="items-left justify-left flex w-full flex-col gap-1">
      <Group />
      <div id="addNew" className="flex w-full items-center justify-between">
        <h2 className="font-serif text-xl text-white">Notebooks</h2>
        <button
          className="text-md rounded-lg bg-orange-600 px-3 py-1 text-white"
          onClick={addFolder}
        >
          +
        </button>
      </div>
      <div className="-ml-12 flex w-full overflow-x-auto font-serif md:ml-0 md:pl-12  ">
        {folders.map((folder) => (
          <Folder
            key={folder.folderId}
            folderName={folder.folderName}
            folderId={folder.folderId}
          />
        ))}
        
      </div>
    </div>
  );
};

export default Fold;