"use client";
import useSWR, { type SWRResponse } from 'swr';
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
  return response.json() as Promise<FolderType[]>;
};

const Fold = () => {
  const { folderName } = useFolder();
  const { data: folders = [], error, mutate }: SWRResponse<FolderType[], Error> = useSWR<FolderType[], Error>('/api/folder', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });
  
  const isLoading = !folders && !error;

  const generateId = () => {
    const id: string = uuidv4();
    const sanitizedId = id.replace(/-/g, "");
    let hash = 0;
    for (let i = 0; i < sanitizedId.length; i++) {
      hash = (hash << 5) - hash + sanitizedId.charCodeAt(i);
      hash &= hash;
    }
    return Math.abs(hash);
  };

  const addFolder = async () => {
    const newFolderId = generateId();
    const newId = uuidv4();
    const newFolderName = `${folderName} ${folders.length + 1}`;
    
    const newFolder: FolderType = {
      folderId: newFolderId,
      id: newId,
      userId: '', // This will be set by the server
      folderName: newFolderName,
    };

    try {
      await mutate(async (currentFolders = []) => [...currentFolders, newFolder], {
        optimisticData: [...folders, newFolder],
        rollbackOnError: true,
        revalidate: false,
      });

      const response = await fetch("/api/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName: newFolderName,
          folderId: newFolderId,
          id: newId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      await response.json();
      
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
    return <div className="font-serif">Error fetching folders: {error.message}</div>;
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
        {folders.map((folder) => (
          <Folder
            key={`folder-${folder.folderId}-${folder.id}`}
            folderName={folder.folderName}
            folderId={folder.folderId}
          />
        ))}
      </div>
    </div>
  );
};

export default Fold;