"use client";

import React, { useState } from "react";
import { useFolder } from "../../components/ui/FolderContext";
import { UploadButton } from "../../utils/uploadthing";
import PdfViewer from "./PDFViewer";
import { X } from "lucide-react";
import "@uploadthing/react/styles.css";
import { useAuth } from "@clerk/nextjs";
import useSWR, { mutate } from "swr";

interface Image {
  id: number;
  url: string;
  name: string;
}

interface ClientComponentProps {
  images: Image[];
  folderId: number;
}

const ClientComponent: React.FC<ClientComponentProps> = ({
  images: initialImages,
  folderId,
}) => {
  const { folderName, setFolderName } = useFolder();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const userId = useAuth();

  // Use SWR with mutate only - no fetcher since we get initial data from props
  const { data: images = initialImages } = useSWR<Image[]>(
    `folder-${folderId}-images`,
    null,
    {
      fallbackData: initialImages,
      revalidateOnFocus: false,
    }
  );

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  const openPdfViewer = (url: string) => {
    setSelectedPdfUrl(url);
  };

  const handleUploadComplete = async (response: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>) => {
    try {
      // Optimistically update the UI
      const newImages = response.map((file, index) => ({
        id: Date.now() + index, // Temporary ID
        url: file.url,
        name: file.name,
      }));

      // Optimistically update the cache
      await mutate(
        `folder-${folderId}-images`,
        [...(images || []), ...newImages],
        false
      );

      // Send the file data to the API
      const uploadPromises = response.map(fileData => 
        fetch('/api/uploadfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...fileData,
            folderId,
            userId,
          }),
        })
      );
      
      await Promise.all(uploadPromises);
      setModalOpen(false);
      //window.location.reload(); // Keep the reload as it was in the original code
    } catch (error) {
      console.error('Error updating database:', error);
      // Revert optimistic update on error
      await mutate(
        `folder-${folderId}-images`,
        initialImages
      );
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="w-full">
          {isEditing ? (
            <input
              type="text"
              value={folderName}
              onChange={handleFolderNameChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-none bg-transparent text-3xl text-orange-600 outline-none"
            />
          ) : (
            <h1
              className="cursor-pointer text-3xl"
              onClick={() => setIsEditing(true)}
            >
              {folderName}
            </h1>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-md rounded-lg bg-orange-600 px-3 py-1 text-[#f7eee3]"
        >
          +
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          aria-hidden={!isModalOpen}
        >
          <div className="h-1/2 w-2/3 max-w-lg rounded-lg border-2 border-[#f7eee325] bg-[#0c0c0cae] p-4 backdrop-blur-lg">
            <div className="m-1 flex items-center justify-between p-4">
              <h2 className="text-lg">Upload Your File</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg bg-orange-600 px-3 py-1 text-[#f7eee3]"
                aria-label="Close Modal"
              >
                Close
              </button>
            </div>

            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  void handleUploadComplete(res);
                }
              }}
              className="h-2/3 w-full rounded border-2 border-dashed border-[#f7eee3]/30 py-2 text-[#f7eee3] hover:border-[#f7eee3]"
            />
          </div>
        </div>
      )}

      <div className="item-center flex h-[250px] w-full flex-wrap gap-4">
        {images?.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="flex flex-col items-center justify-center gap-6 motion-scale-in-[0.83]"
          >
            <div
              onClick={() => openPdfViewer(image.url)}
              className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
            >
              <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                {image.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPdfUrl && (
        <div className="fixed inset-0 flex w-[100svw] bg-orange-700 bg-opacity-50">
          <div className="relative w-[100svw] items-center justify-center rounded-lg bg-[#0c0c0c]">
            <button
              onClick={() => setSelectedPdfUrl(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-[#f7eee3] p-1 text-[#ff5e00]"
              aria-label="Close PDF Viewer"
            >
              <X />
            </button>
            <PdfViewer fileUrl={selectedPdfUrl} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientComponent;