"use client";
import useSWR, { mutate } from 'swr';
import React from "react";
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

const fetcher = async () => {
  const response = await fetch("/api/folder");
  if (!response.ok) throw new Error("Failed to fetch folders");
  return (await response.json()) as FolderType[];
};

const Fold = () => {
const { folderName } = useFolder();
const { data: folders, error } = useSWR<FolderType[]>('folder', fetcher) as { data: FolderType[] | undefined; error: Error | null };
const isLoading = !folders && !error;

  const generateId = () => {
    const id: string = uuidv4();
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
      const newFolderName = `${folderName} ${(folders?.length ?? 0) + 1}`;

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
    await response.json() as FolderType;

    // Replace setFolders with mutate
    void mutate('folder');
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

if (error) {
    return <div className="font-serif">Error fetching folders: {error instanceof Error ? error.message : 'An error occurred'}</div>;
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
      <div className="-ml-12 flex w-full overflow-x-auto font-serif md:ml-0 md:pl-12">
        {folders?.map((folder) => (
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